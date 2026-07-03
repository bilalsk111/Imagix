import React from 'react';

const PromptInput = ({
  prompt,
  setPrompt,
  onGenerate,
  isGenerating,
  disabled,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey && !disabled && prompt.trim()) {
      onGenerate();
    }
  };

  return (
    <div className="input-block">
      <div className="input-header">
        <label htmlFor="prompt-input" className="input-label">
          Describe your vision
        </label>
      </div>

      <div className="textarea-container">
        <textarea
          id="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A futuristic city with flying cars at sunset, cinematic lighting, ultra-detailed..."
          disabled={disabled}
          onKeyDown={handleKeyDown}
          rows={5}
        />
      </div>

      <div className="controls-dashboard">

        <button
          type="button"
          className="btn btn-primary"
          onClick={onGenerate}
          disabled={disabled || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <span className="loader loader-sm" /> Generating…
            </>
          ) : (
            'Generate Image'
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptInput;