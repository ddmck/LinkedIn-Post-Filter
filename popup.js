const newlineThresholdInput = document.getElementById("newline-threshold");
const avgLineLengthThresholdInput = document.getElementById(
  "avg-line-length-threshold",
);
const blockedKeywordsInput = document.getElementById("blocked-keywords");
const emojiSentenceThresholdInput = document.getElementById(
  "emoji-sentence-threshold",
);
const debugModeInput = document.getElementById("debug-mode");
const saveButton = document.getElementById("save-button");

// Load the saved settings from storage and set them in the inputs.
chrome.storage.sync.get(
  [
    "newlineThreshold",
    "avgLineLengthThreshold",
    "blockedKeywords",
    "emojiSentenceThreshold",
    "debugMode",
  ],
  (result) => {
    newlineThresholdInput.value = result.newlineThreshold || 5;
    avgLineLengthThresholdInput.value = result.avgLineLengthThreshold || 30;
    blockedKeywordsInput.value = result.blockedKeywords || "Claude Code,Cursor";
    emojiSentenceThresholdInput.value = result.emojiSentenceThreshold || 3;
    debugModeInput.checked = result.debugMode || false;
  },
);

// Save the settings to storage when the save button is clicked.
saveButton.addEventListener("click", () => {
  const newlineThreshold = newlineThresholdInput.value;
  const avgLineLengthThreshold = avgLineLengthThresholdInput.value;
  const blockedKeywords = blockedKeywordsInput.value;
  const emojiSentenceThreshold = emojiSentenceThresholdInput.value;
  const debugMode = debugModeInput.checked;
  chrome.storage.sync.set(
    {
      newlineThreshold,
      avgLineLengthThreshold,
      blockedKeywords,
      emojiSentenceThreshold,
      debugMode,
    },
    () => {
      console.log("Settings saved:", {
        newlineThreshold,
        avgLineLengthThreshold,
        blockedKeywords,
        emojiSentenceThreshold,
        debugMode,
      });
    },
  );
});
