import type { DiagramDef } from '@/lib/types';
import { distributedSystemsDiagrams } from './distributed-systems';
import { networkingSecurityDiagrams } from './networking-security';
import { dataMlPipelinesDiagrams } from './data-ml-pipelines';
import { appWebArchitectureDiagrams } from './app-web-architecture';
import { businessProcessesDiagrams } from './business-processes';
import { algorithmsCsDiagrams } from './algorithms-cs';
import { devopsCloudDiagrams } from './devops-cloud';
import { databasesStorageDiagrams } from './databases-storage';
import { authIdentityDiagrams } from './auth-identity';

const diagramMap: Record<string, DiagramDef[]> = {
  'distributed-systems': distributedSystemsDiagrams,
  'networking-security': networkingSecurityDiagrams,
  'data-ml-pipelines': dataMlPipelinesDiagrams,
  'app-web-architecture': appWebArchitectureDiagrams,
  'business-processes': businessProcessesDiagrams,
  'algorithms-cs': algorithmsCsDiagrams,
  'devops-cloud': devopsCloudDiagrams,
  'databases-storage': databasesStorageDiagrams,
  'auth-identity': authIdentityDiagrams,
};

/**
 * Returns the diagram definitions for a given category slug.
 */
export function getDiagramsByCategory(slug: string): DiagramDef[] {
  return diagramMap[slug] ?? [];
}
