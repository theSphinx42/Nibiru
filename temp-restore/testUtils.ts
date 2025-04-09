export const logTestResult = (
  pageName: string,
  componentName: string,
  mounted: boolean
) => {
  const status = mounted ? '✅' : '❌';
  const message = mounted
    ? `${componentName} mounted successfully on ${pageName}`
    : `${componentName} failed to mount on ${pageName}`;
    
  console.log(`${status} ${message}`);
  
  return {
    success: mounted,
    message
  };
};

export const verifyRouteChange = async (
  router: any,
  targetPath: string
): Promise<boolean> => {
  const start = Date.now();
  const timeout = 5000; // 5 second timeout

  while (Date.now() - start < timeout) {
    if (router.asPath === targetPath) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return false;
};

export const simulateUserInteraction = async (
  element: Element,
  action: 'click' | 'input' | 'hover',
  value?: string
) => {
  switch (action) {
    case 'click':
      element.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      break;
    case 'input':
      if (element instanceof HTMLInputElement && value) {
        element.value = value;
        element.dispatchEvent(new Event('input', {
          bubbles: true,
          cancelable: true
        }));
      }
      break;
    case 'hover':
      element.dispatchEvent(new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      break;
  }

  // Wait for any potential effects
  await new Promise(resolve => setTimeout(resolve, 100));
}; 