'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getProject, updateProjectPhaseStatus } from '@/lib/services/projectService';
import { Project, ProjectPhase, PhaseStatus } from '@/lib/types';
import WorkflowPhaseIndicator from '@/components/projects/WorkflowPhaseIndicator';
import Breadcrumb from '@/components/ui/Breadcrumb';
import AuthGuard from '@/components/auth/AuthGuard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPhase, setUpdatingPhase] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!user || !id) return;
      
      try {
        setLoading(true);
        setError(null);
        const projectData = await getProject(id as string);
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  const handlePhaseClick = (phase: ProjectPhase) => {
    if (!project || !id) return;
    router.push(`/projects/${id}/phases/${phase}`);
  };

  const handleUpdatePhaseStatus = async (phase: ProjectPhase, status: PhaseStatus) => {
    if (!project || !id) return;
    
    try {
      setUpdatingPhase(true);
      setError(null);
      const updatedProject = await updateProjectPhaseStatus(id as string, phase, status);
      setProject(updatedProject);
    } catch (err) {
      console.error('Error updating phase status:', err);
      setError('Failed to update phase status. Please try again.');
    } finally {
      setUpdatingPhase(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Projects', href: '/projects' },
    { label: project?.name || 'Project Details' },
  ];

  if (loading) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error || !project) {
    return (
      <AuthGuard>
        <div className="container mx-auto px-4 py-8">
          <Breadcrumb items={breadcrumbItems} />
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error || 'Project not found'}
          </div>
          <button
            onClick={() => router.push('/projects')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
          <div className="md:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{project.name}</h1>
              <p className="text-gray-700 mb-6">{project.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Source Language</h3>
                  <p className="text-base font-medium">{project.sourceLanguage}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Target Languages</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {project.targetLanguages.map((language, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Calculate overall progress */}
              {(() => {
                const totalPhases = Object.keys(project.phases).length;
                const completedPhases = Object.values(project.phases).filter(status => status === PhaseStatus.COMPLETED).length;
                const progress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
                
                return (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-sm font-medium text-gray-500">Overall Progress</h3>
                      <span className="text-sm font-medium text-gray-700">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })()}
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <WorkflowPhaseIndicator 
                project={project} 
                onPhaseClick={handlePhaseClick}
              />
            </div>
          </div>
          
          <div className="md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {project.phases[ProjectPhase.SUBTITLE_TRANSLATION] === PhaseStatus.NOT_STARTED && (
                  <button
                    onClick={() => handleUpdatePhaseStatus(ProjectPhase.SUBTITLE_TRANSLATION, PhaseStatus.IN_PROGRESS)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={updatingPhase}
                  >
                    Start Translation Phase
                  </button>
                )}
                {project.phases[ProjectPhase.SUBTITLE_TRANSLATION] === PhaseStatus.IN_PROGRESS && (
                  <button
                    onClick={() => handleUpdatePhaseStatus(ProjectPhase.SUBTITLE_TRANSLATION, PhaseStatus.COMPLETED)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={updatingPhase}
                  >
                    Complete Translation Phase
                  </button>
                )}
                {project.phases[ProjectPhase.SUBTITLE_TRANSLATION] === PhaseStatus.COMPLETED && 
                 project.phases[ProjectPhase.TRANSLATION_PROOFREADING] === PhaseStatus.NOT_STARTED && (
                  <button
                    onClick={() => handleUpdatePhaseStatus(ProjectPhase.TRANSLATION_PROOFREADING, PhaseStatus.IN_PROGRESS)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={updatingPhase}
                  >
                    Start Proofreading Phase
                  </button>
                )}

                <button
                  onClick={() => router.push(`/projects/${id}/edit`)}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Edit Project
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Project Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Created</h3>
                  <p className="text-sm text-gray-900">{(project.createdAt instanceof Date ? project.createdAt : new Date()).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                  <p className="text-sm text-gray-900">{(project.updatedAt instanceof Date ? project.updatedAt : new Date()).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Current Phase</h3>
                  <p className="text-sm text-gray-900">
                    {project.currentPhase.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}