interface DiagnosticResult {
  success: boolean;
  message: string;
  timestamp: string;
  components: {
    name: string;
    rendered: boolean;
  }[];
}

export const runDiagnostics = (pathname: string): DiagnosticResult => {
  const timestamp = new Date().toISOString();
  const components = document.querySelectorAll('[data-testid]');
  const renderedComponents = Array.from(components).map(el => ({
    name: el.getAttribute('data-testid') || '',
    rendered: true
  }));

  const success = renderedComponents.length > 0;
  const message = success
    ? `✅ ${pathname} loaded successfully with ${renderedComponents.length} components`
    : `❌ ${pathname} failed to load expected components`;

  console.group('🔍 Page Diagnostics');
  console.log(`Path: ${pathname}`);
  console.log(`Time: ${new Date().toLocaleTimeString()}`);
  console.log(`Components Rendered: ${renderedComponents.length}`);
  renderedComponents.forEach(c => {
    console.log(`${c.rendered ? '✅' : '❌'} ${c.name}`);
  });
  console.groupEnd();

  return {
    success,
    message,
    timestamp,
    components: renderedComponents
  };
}; 