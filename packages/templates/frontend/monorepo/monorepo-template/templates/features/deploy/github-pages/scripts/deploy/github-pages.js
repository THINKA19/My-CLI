export async function deploy() {
  if (process.env.GITHUB_ACTIONS !== 'true')
    throw new Error('GitHub Pages 请通过生成的 GitHub Actions 工作流发布')
  // Artifact upload and publication are handled by the platform workflow.
}
