/**
 * A lightweight, native SSE (Server-Sent Events) implementation for React Native
 * that uses XMLHttpRequest. This avoids adding external dependencies to the project.
 */
export function streamSSE(
  url: string,
  onMessage: (data: any) => void,
  onError: (err: any) => void
) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  
  let seenBytes = 0;
  
  xhr.onreadystatechange = () => {
    // readyState 3 is LOADING (chunk received), readyState 4 is DONE
    if (xhr.readyState === 3 || xhr.readyState === 4) {
      const responseText = xhr.responseText;
      const newChunk = responseText.substring(seenBytes);
      seenBytes = responseText.length;
      
      // SSE messages are separated by double newlines, lines start with "data:"
      const lines = newChunk.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data:')) {
          try {
            const jsonStr = trimmed.substring(5).trim();
            if (jsonStr) {
              const data = JSON.parse(jsonStr);
              onMessage(data);
            }
          } catch (e) {
            console.warn('Failed to parse SSE JSON line:', line, e);
          }
        }
      }
    }
    
    if (xhr.readyState === 4) {
      if (xhr.status < 200 || xhr.status >= 300) {
        onError(new Error(`Request failed with status ${xhr.status}`));
      }
    }
  };
  
  xhr.onerror = (err) => {
    onError(err);
  };
  
  xhr.send();
  
  return {
    close: () => {
      xhr.abort();
    }
  };
}
