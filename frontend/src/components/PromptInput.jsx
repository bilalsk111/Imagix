import React from 'react';

const PromptInput = ({
  prompt,
  setPrompt,
  onEnhance,
  isEnhancing,
  shouldEnhance,
  setShouldEnhance,
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
        <button
          type="button"
          className="magic-enhance-pill"
          onClick={onEnhance}
          disabled={disabled || !prompt.trim()}
          title="Rewrite your prompt with AI-powered detail"
        >
          {isEnhancing ? 'Enhancing…' : '✨ Magic Enhance'}
        </button>
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
        {isEnhancing && (
          <div className="blur-overlay">
            <div className="loader" />
            <span className="overlay-text">Enhancing your prompt…</span>
          </div>
        )}
      </div>

      <div className="controls-dashboard">
        <label className="toggle-switch-wrapper" htmlFor="enhance-checkbox">
          <div className="switch-track">
            <input
              id="enhance-checkbox"
              type="checkbox"
              checked={shouldEnhance}
              onChange={(e) => setShouldEnhance(e.target.checked)}
              disabled={disabled}
            />
            <span className="switch-thumb" />
          </div>
          <span className="toggle-label">Auto-enhance before generating</span>
        </label>

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