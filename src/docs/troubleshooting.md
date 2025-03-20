
# CrewSUMMIT Troubleshooting Guide

This guide provides solutions for common issues you might encounter while using or developing with CrewSUMMIT.

## Table of Contents

1. [Application Issues](#application-issues)
2. [Development Environment Issues](#development-environment-issues)
3. [Database and Storage Issues](#database-and-storage-issues)
4. [UI and Rendering Issues](#ui-and-rendering-issues)
5. [API Integration Issues](#api-integration-issues)
6. [Performance Issues](#performance-issues)
7. [Deployment Issues](#deployment-issues)
8. [Diagnostic Tools](#diagnostic-tools)

## Application Issues

### Application Fails to Start

**Symptoms**:
- Blank screen on startup
- Console errors during initialization
- Application crashes immediately

**Solutions**:

1. **Check browser console for errors**:
   - Open browser developer tools (F12 or Ctrl+Shift+I)
   - Look for error messages in the Console tab

2. **Verify environment variables**:
   - Ensure all required environment variables are set in `.env`
   - Check that environment variables are properly formatted

3. **Clear browser cache and storage**:
   - Clear browser cache and cookies
   - In developer tools, go to Application > Storage > Clear Site Data

4. **Try a different browser**:
   - Test in Chrome, Firefox, or Edge to isolate browser-specific issues

### Authentication Issues

**Symptoms**:
- Unable to log in
- Frequent session expirations
- "Unauthorized" errors in console

**Solutions**:

1. **Clear local storage**:
   - In developer tools, go to Application > Local Storage
   - Delete stored tokens or authentication data

2. **Check token expiration**:
   - Verify the token expiration logic in authentication service
   - Ensure token refresh is working properly

3. **Verify API keys**:
   - Check that API keys for LLM providers are valid and not expired
   - Ensure keys have appropriate permissions

## Development Environment Issues

### Build Errors

**Symptoms**:
- Build fails with TypeScript errors
- Webpack/Vite compilation errors
- Missing dependency errors

**Solutions**:

1. **Update dependencies**:
   ```bash
   npm update
   ```

2. **Clear node_modules and reinstall**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Check TypeScript errors**:
   ```bash
   npx tsc --noEmit
   ```

4. **Verify imports and file paths**:
   - Ensure file paths in imports match the actual file structure
   - Check for case sensitivity issues in imports

### Hot Module Replacement Not Working

**Symptoms**:
- Changes don't reflect in browser
- Need to manually refresh to see changes
- HMR errors in console

**Solutions**:

1. **Check Vite configuration**:
   - Verify `vite.config.ts` has proper settings for HMR

2. **Restart development server**:
   ```bash
   npm run dev
   ```

3. **Try disabling browser extensions**:
   - Some ad blockers or privacy extensions can interfere with WebSockets

4. **Check for React key issues**:
   - Ensure components in lists have unique, stable keys

## Database and Storage Issues

### Data Not Persisting

**Symptoms**:
- Created items disappear on refresh
- Settings don't save
- "Database not available" errors

**Solutions**:

1. **Check IndexedDB access**:
   - In developer tools, go to Application > IndexedDB
   - Verify database exists and contains expected data
   - Check for IndexedDB errors in console

2. **Browser storage permissions**:
   - Ensure the browser allows IndexedDB storage for the site
   - Check browser privacy settings

3. **Try in incognito/private mode**:
   - Some browser extensions can interfere with IndexedDB

4. **Implement data recovery**:
   ```javascript
   // Try to recover data from localStorage backup
   try {
     await localDB.restore();
     console.log('Database restored from backup');
   } catch (error) {
     console.error('Recovery failed:', error);
   }
   ```

### Database Version Errors

**Symptoms**:
- "Version change transaction blocked" errors
- Database version conflicts
- Data migration failures

**Solutions**:

1. **Close all other tabs with the application**:
   - IndexedDB version upgrades are blocked if the database is open elsewhere

2. **Clear application data and start fresh**:
   - In developer tools, go to Application > Storage > Clear Site Data

3. **Implement version handling logic**:
   ```javascript
   // Handle blocked version change
   request.onblocked = () => {
     alert('Please close all other tabs running this application');
   };
   ```

## UI and Rendering Issues

### Layout and Styling Problems

**Symptoms**:
- Elements misaligned or overlapping
- Inconsistent styling across pages
- CSS classes not applying

**Solutions**:

1. **Check responsive design**:
   - Resize browser window to test at different breakpoints
   - Use browser dev tools device emulation

2. **Verify Tailwind classes**:
   - Ensure Tailwind classes are applied correctly
   - Check for typos in class names

3. **Inspect element styles**:
   - Use browser developer tools to inspect elements
   - Look for CSS conflicts or overrides

4. **Clear browser cache**:
   - Hard refresh (Ctrl+F5 or Cmd+Shift+R)
   - Clear browser cache to reload CSS

### Component Rendering Issues

**Symptoms**:
- Components not rendering
- Unexpected component behavior
- React rendering errors in console

**Solutions**:

1. **Check for React key issues**:
   - Ensure list items have unique, stable keys
   - Fix "key prop" warnings in console

2. **Debug component props**:
   ```javascript
   const MyComponent = (props) => {
     console.log('Component props:', props);
     // Component implementation
   };
   ```

3. **Verify component lifecycle**:
   - Use React DevTools to inspect component tree
   - Check component mounting/unmounting

4. **Test with simpler data**:
   - Try rendering with simplified props
   - Isolate complex components

## API Integration Issues

### API Connection Failures

**Symptoms**:
- Network errors in console
- API endpoints returning errors
- Timeout errors

**Solutions**:

1. **Check network requests**:
   - In browser dev tools, go to Network tab
   - Inspect request/response details

2. **Verify API endpoints**:
   - Ensure API URLs are correct
   - Test endpoints with tools like Postman

3. **Check CORS settings**:
   - Look for CORS errors in console
   - Ensure API allows requests from your domain

4. **Implement better error handling**:
   ```javascript
   try {
     const response = await fetch(url);
     if (!response.ok) {
       throw new AppError(
         `API returned ${response.status}: ${response.statusText}`,
         ErrorType.API
       );
     }
     return await response.json();
   } catch (error) {
     throw handleError(error, true);
   }
   ```

### LLM API Issues

**Symptoms**:
- AI models not responding
- Token errors or quota exceeded errors
- Incomplete or unexpected AI responses

**Solutions**:

1. **Verify API keys**:
   - Check that API keys for OpenAI, Anthropic, etc. are valid
   - Ensure API keys are correctly set in environment variables

2. **Check rate limits**:
   - Look for rate limit errors in responses
   - Implement rate limiting and retry logic

3. **Optimize token usage**:
   - Reduce prompt sizes
   - Implement proper context management

4. **Try alternative models**:
   - If one model is failing, try a different model or provider
   - Implement fallback mechanisms

## Performance Issues

### Slow Application Response

**Symptoms**:
- UI feels sluggish
- Operations take too long
- High CPU usage

**Solutions**:

1. **Use React DevTools Profiler**:
   - Record and analyze component render times
   - Look for unnecessary re-renders

2. **Optimize render performance**:
   - Use `React.memo` for expensive components
   - Implement virtualization for large lists
   ```javascript
   import { FixedSizeList } from 'react-window';
   
   const VirtualizedList = ({ items }) => (
     <FixedSizeList
       height={500}
       width="100%"
       itemCount={items.length}
       itemSize={50}
     >
       {({ index, style }) => (
         <div style={style}>
           {items[index].name}
         </div>
       )}
     </FixedSizeList>
   );
   ```

3. **Optimize state management**:
   - Use appropriate state management techniques
   - Consider local state vs. context vs. global state

4. **Implement code splitting**:
   - Use dynamic imports for large components
   ```javascript
   const HeavyComponent = React.lazy(() => import('./HeavyComponent'));
   
   const MyComponent = () => (
     <React.Suspense fallback={<div>Loading...</div>}>
       <HeavyComponent />
     </React.Suspense>
   );
   ```

### Memory Leaks

**Symptoms**:
- Increasing memory usage over time
- Browser tab crashes after extended use
- Performance degrades over time

**Solutions**:

1. **Clean up effect hooks**:
   ```javascript
   useEffect(() => {
     const subscription = subscribe();
     
     return () => {
       // Cleanup function
       subscription.unsubscribe();
     };
   }, []);
   ```

2. **Check for retained event listeners**:
   - Ensure event listeners are removed
   - Use the React useEffect cleanup function

3. **Monitor memory usage**:
   - Use Chrome DevTools Performance and Memory tabs
   - Take heap snapshots and compare

4. **Fix array and object references**:
   - Avoid creating new arrays/objects on each render
   - Use useMemo/useCallback for reference stability

## Deployment Issues

### Build Failures

**Symptoms**:
- Production build fails
- Build produces errors not seen in development
- Missing assets in production build

**Solutions**:

1. **Check build configuration**:
   - Verify settings in `vite.config.ts`
   - Ensure all necessary files are included

2. **Run build in verbose mode**:
   ```bash
   npm run build -- --debug
   ```

3. **Check environment variables**:
   - Ensure production environment variables are set
   - Verify variable usage and prefix (VITE_*)

4. **Test build locally**:
   ```bash
   npm run build
   npx serve -s dist
   ```

### Deployment Platform Issues

**Symptoms**:
- Application works locally but fails when deployed
- Missing features in deployed version
- Environment-specific errors

**Solutions**:

1. **Check deployment logs**:
   - Review logs from Netlify, Vercel, or other platforms
   - Look for build and runtime errors

2. **Verify environment variables on platform**:
   - Set all required environment variables in platform settings
   - Check for typos or missing variables

3. **Test with platform-specific tools**:
   - Use platform CLI tools for local testing
   - Try different deployment configurations

4. **Check for path issues**:
   - Ensure routing works with the platform's configuration
   - Configure redirects for SPA routing

## Diagnostic Tools

### Browser DevTools

Use browser developer tools for diagnosing issues:

1. **Console**: Check for JavaScript errors and warnings
2. **Network**: Monitor API requests and responses
3. **Elements**: Inspect HTML and CSS
4. **Application**: Examine storage (IndexedDB, localStorage)
5. **Performance**: Analyze runtime performance
6. **Memory**: Check for memory leaks

### React DevTools

Install the React Developer Tools browser extension for:

1. **Component tree inspection**
2. **Props and state examination**
3. **Component profiling**
4. **Render timing analysis**

### Custom Debug Logging

Implement custom logging for better diagnostics:

```javascript
// src/lib/logger.ts
const DEBUG_LEVEL = {
  NONE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
};

// Set this based on environment or user preference
let currentLevel = DEBUG_LEVEL.INFO;

export const logger = {
  setLevel: (level) => {
    currentLevel = level;
  },
  
  error: (message, ...args) => {
    if (currentLevel >= DEBUG_LEVEL.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (currentLevel >= DEBUG_LEVEL.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  info: (message, ...args) => {
    if (currentLevel >= DEBUG_LEVEL.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  debug: (message, ...args) => {
    if (currentLevel >= DEBUG_LEVEL.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
};
```

### Application State Debugging

Add a debug panel for viewing application state:

```javascript
// Simple debug component that can be toggled with a keyboard shortcut
const DebugPanel = () => {
  const [visible, setVisible] = useState(false);
  const { state: agentState } = useAgents();
  const { state: crewState } = useCrews();
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+D to toggle
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setVisible(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (!visible) return null;
  
  return (
    <div className="fixed bottom-0 right-0 w-1/3 h-1/2 bg-black/90 text-white p-4 overflow-auto">
      <h3 className="text-xl mb-2">Debug Information</h3>
      <pre className="text-xs">
        {JSON.stringify({
          agents: agentState.agents,
          crews: crewState.crews,
          // Add more state as needed
        }, null, 2)}
      </pre>
    </div>
  );
};
```

## Getting Additional Help

If you're still experiencing issues after trying the solutions in this guide:

1. **Check GitHub Issues**:
   - Search the project's GitHub issues for similar problems
   - Look for known workarounds or fixes

2. **Community Support**:
   - Join the CrewSUMMIT community forum or Discord
   - Post detailed information about your issue

3. **Create a Detailed Bug Report**:
   - Include browser and OS information
   - Provide steps to reproduce
   - Share console logs and screenshots
   - Describe expected vs. actual behavior

4. **Contact the Developers**:
   - Reach out to the project team with your issue
   - Provide as much diagnostic information as possible
