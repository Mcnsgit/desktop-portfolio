

const WindowLoading = ({ message }: { message?: string }) => {

    return (
    <div className="window-loading-container">
        <div className="loading-indicator"></div>
        <p>{message}</p>
        <style jsx>{`
        .window-loading-cntainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content:center;
        height: 100%
        width: 100%
        padding: 20px;
        background: #f0f0f0;
        font-family: 'MS Sans Serif, sans-serif;
        }
        .loading-indicator {
        width: 32px;
        height: 32px;
        border:4px solid #c0c0c0;
        border-top: 4px solid #0078d7;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      p {
        color: #444;
        text-align: center;
      }
    `}</style>
    </div>
    )
}

export default WindowLoading 