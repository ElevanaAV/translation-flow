import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  Timestamp,
  orderBy,
  DocumentSnapshot,
  QueryDocumentSnapshot,
  FirestoreError
} from 'firebase/firestore';
import { firestore } from '../firebase';
import { Project, ProjectFormData, ProjectPhase, PhaseStatus, ErrorResponse, ProjectPhases } from '../types';
import { FieldValue } from 'firebase/firestore';
import { PHASE_SEQUENCE } from '../constants';

const PROJECTS_COLLECTION = 'projects';

/**
 * Converts Firestore document to Project object with proper typing
 */
const convertToProject = (doc: DocumentSnapshot | QueryDocumentSnapshot): Project => {
  const data = doc.data();
  if (!data) {
    throw new Error('Document data is empty');
  }
  
  return {
    id: doc.id,
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
  } as Project;
};

/**
 * Creates a standardized error response
 */
const createErrorResponse = (error: unknown, defaultMessage = 'An error occurred'): ErrorResponse => {
  if (error instanceof FirestoreError) {
    return {
      message: error.message,
      code: error.code,
      details: error
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
      details: error
    };
  }
  
  return {
    message: defaultMessage,
    details: error
  };
};

/**
 * Creates default phases object with all phases set to NOT_STARTED
 */
const createDefaultPhases = (): ProjectPhases => {
  return PHASE_SEQUENCE.reduce((phases, phase) => {
    phases[phase] = PhaseStatus.NOT_STARTED;
    return phases;
  }, {} as ProjectPhases);
};

/**
 * Creates a new project
 */
export const createProject = async (projectData: ProjectFormData, userId: string): Promise<Project> => {
  try {
    // Initialize project with default values for phases
    const newProject: Omit<Project, 'id'> = {
      ...projectData,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      currentPhase: ProjectPhase.SUBTITLE_TRANSLATION,
      phases: createDefaultPhases()
    };

    const docRef = await addDoc(collection(firestore, PROJECTS_COLLECTION), newProject);
    
    // For better performance, construct the project directly instead of fetching it again
    return {
      ...newProject,
      id: docRef.id,
      // Convert server timestamps to Date objects for client use
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error creating project:', error);
    const errorResponse = createErrorResponse(error, 'Failed to create project');
    throw errorResponse;
  }
};

/**
 * Gets a project by ID
 */
export const getProject = async (projectId: string): Promise<Project> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    return convertToProject(docSnap);
  } catch (error) {
    console.error('Error fetching project:', error);
    const errorResponse = createErrorResponse(error, `Failed to fetch project with ID ${projectId}`);
    throw errorResponse;
  }
};

/**
 * Gets all projects for a user
 */
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    const q = query(
      collection(firestore, PROJECTS_COLLECTION),
      where('createdBy', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertToProject);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    const errorResponse = createErrorResponse(error, 'Failed to fetch user projects');
    throw errorResponse;
  }
};

/**
 * Updates an existing project
 */
export const updateProject = async (projectId: string, projectData: Partial<Project>): Promise<Project> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    
    // First get current project to validate it exists
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    // Remove id from update data and add updatedAt timestamp
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = projectData;
    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(docRef, dataToUpdate);
    
    // Combine current data with updates for better performance
    const currentData = convertToProject(currentDoc);
    return {
      ...currentData,
      ...updateData,
      id: projectId,
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error updating project:', error);
    const errorResponse = createErrorResponse(error, `Failed to update project with ID ${projectId}`);
    throw errorResponse;
  }
};

/**
 * Updates the phase status of a project
 */
export const updateProjectPhaseStatus = async (
  projectId: string, 
  phase: ProjectPhase, 
  status: PhaseStatus
): Promise<Project> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    
    // First get current project to validate it exists
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    const currentProject = convertToProject(currentDoc);
    
    const updateData: Record<string, PhaseStatus | ProjectPhase | FieldValue> = {
      [`phases.${phase}`]: status,
      updatedAt: serverTimestamp()
    };
    
    // If starting a new phase, update the current phase
    if (status === PhaseStatus.IN_PROGRESS) {
      updateData.currentPhase = phase;
    }
    
    await updateDoc(docRef, updateData);
    
    // Combine current data with updates for better performance
    return {
      ...currentProject,
      phases: {
        ...currentProject.phases,
        [phase]: status
      },
      ...(status === PhaseStatus.IN_PROGRESS ? { currentPhase: phase } : {}),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error updating project phase:', error);
    const errorResponse = createErrorResponse(error, `Failed to update phase status for project with ID ${projectId}`);
    throw errorResponse;
  }
};

/**
 * Deletes a project
 */
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const docRef = doc(firestore, PROJECTS_COLLECTION, projectId);
    
    // First check if the project exists
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Project with ID ${projectId} not found`);
    }
    
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    const errorResponse = createErrorResponse(error, `Failed to delete project with ID ${projectId}`);
    throw errorResponse;
  }
};