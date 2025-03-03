'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Link from 'next/link';

// Mock project data
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  languages: string[];
  updatedAt: string;
  progress: number;
}

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Website Localization',
    description: 'Company website localization project for multiple languages',
    status: 'active',
    languages: ['Spanish', 'French', 'German', 'Italian', 'Japanese'],
    updatedAt: '2024-02-28T12:00:00Z',
    progress: 65,
  },
  {
    id: '2',
    name: 'Mobile App Localization',
    description: 'Localization of mobile app UI and content',
    status: 'active',
    languages: ['French', 'German', 'Portuguese'],
    updatedAt: '2024-02-25T10:30:00Z',
    progress: 40,
  },
  {
    id: '3',
    name: 'Marketing Materials',
    description: 'Translation of marketing materials and campaign content',
    status: 'active',
    languages: ['Spanish', 'French', 'Portuguese', 'German', 'Russian', 'Chinese', 'Japanese', 'Korean'],
    updatedAt: '2024-02-20T15:45:00Z',
    progress: 80,
  },
  {
    id: '4',
    name: 'Product Documentation',
    description: 'Technical documentation for product manuals',
    status: 'completed',
    languages: ['Spanish', 'French', 'German'],
    updatedAt: '2024-01-15T09:20:00Z',
    progress: 100,
  },
  {
    id: '5',
    name: 'Legal Documents',
    description: 'Translation of legal documents and agreements',
    status: 'archived',
    languages: ['French', 'Spanish'],
    updatedAt: '2023-12-10T14:30:00Z',
    progress: 100,
  },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const router = useRouter();

  useEffect(() => {
    // Simulate loading data from API
    const timeout = setTimeout(() => {
      setProjects(MOCK_PROJECTS);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.status === filter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage all your translation projects from a central location
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              leftIcon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              }
              onClick={() => router.push('/projects/new')}
            >
              New Project
            </Button>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Project List</h3>
              <div className="mt-3 sm:mt-0 flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded ${
                    filter === 'all' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('active')}
                  className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded ${
                    filter === 'active' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded ${
                    filter === 'completed' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => setFilter('archived')}
                  className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded ${
                    filter === 'archived' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Archived
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {filter === 'all' 
                  ? "Get started by creating a new project." 
                  : `No ${filter} projects found.`}
              </p>
              {filter === 'all' && (
                <div className="mt-6">
                  <Button
                    leftIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    }
                    onClick={() => router.push('/projects/new')}
                  >
                    New Project
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <li key={project.id}>
                  <Link href={`/projects/${project.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="truncate">
                          <div className="flex items-center space-x-3">
                            <p className="text-sm font-medium text-primary truncate">{project.name}</p>
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(project.status)}`}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <div className="w-24 bg-gray-200 rounded-full h-2.5 mt-2">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">{project.progress}%</span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                            </svg>
                            {project.languages.length} {project.languages.length === 1 ? 'language' : 'languages'}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Updated {new Date(project.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          View Details
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}