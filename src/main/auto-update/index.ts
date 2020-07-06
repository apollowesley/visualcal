import * as azdev from 'azure-devops-node-api';
import { BuildStatus, BuildResult } from 'azure-devops-node-api/interfaces/BuildInterfaces';

// https://dev.azure.com/indysoftdev/_apis/resources/Containers/1853201/release?itemPath=release%2Fdist%2FVisualCal%20Setup%200.1.0.exe

export const getLatestAzureDevOpsBuildArtifact = async (organization: string, project: string) => {
  const orgUrl = `https://dev.azure.com/${organization}`;
  const token = 'r5pnxznomrprdius2ojbwnjrw2izzikepwuuarfueajt5bepq56q';
  const authHandler = azdev.getPersonalAccessTokenHandler(token);
  const connection = new azdev.WebApi(orgUrl, authHandler);
  const buildApi = await connection.getBuildApi();
  const projectBuilds = await buildApi.getBuilds(project, undefined, undefined, undefined, undefined, undefined, undefined, undefined, BuildStatus.Completed, BuildResult.Succeeded);
  if (projectBuilds.length > 0) {
    const build = projectBuilds[0];
    if (build.id) {
      const buildArtifacts = await buildApi.getArtifacts(project, build.id);
      if (buildArtifacts.length > 0) {
        const buildArtifact = buildArtifacts[0]; // This is the most recent completed and succeeded build artifact
        if (buildArtifact.resource) {
          if (buildArtifact.resource.downloadUrl) return buildArtifact.resource.downloadUrl;
        }
        return buildArtifact.id;
      }
    }
  }
  return undefined;
}
