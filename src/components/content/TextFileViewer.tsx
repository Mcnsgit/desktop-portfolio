import React from "react";

const TextFileViewer = ({content} : {content:string}) => {
     return (
    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0 }}>
      {content}
    </pre>
  );
};

export default TextFileViewer;
