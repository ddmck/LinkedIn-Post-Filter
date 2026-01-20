let newlineThreshold = 5;
let avgLineLengthThreshold = 30;
let blockedKeywords = "Claude Code,Cursor";
let emojiSentenceThreshold = 3;
let debugMode = false;

// Load the saved settings from storage
chrome.storage.sync.get(
  [
    "newlineThreshold",
    "avgLineLengthThreshold",
    "blockedKeywords",
    "emojiSentenceThreshold",
    "debugMode",
  ],
  (result) => {
    newlineThreshold = result.newlineThreshold || 5;
    avgLineLengthThreshold = result.avgLineLengthThreshold || 30;
    blockedKeywords = result.blockedKeywords || "Claude Code,Cursor";
    emojiSentenceThreshold = result.emojiSentenceThreshold || 3;
    debugMode = result.debugMode || false;
  },
);

function startsWithEmoji(str) {
  const emojiRegex =
    /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str.trim());
}

function hidePosts() {
  const posts = document.querySelectorAll(".feed-shared-update-v2");

  posts.forEach((post) => {
    const content = post.querySelector(".update-components-text");
    if (content) {
      const html = content.innerHTML;
      const lines = html.split(
        /<span>\s*<br>\s*<\/span>\s*<span>\s*<br>\s*<\/span>/,
      );
      const numLines = lines.length;
      const textContent = content.innerText;

      let reasons = [];

      // Check for blocked keywords
      const keywords = blockedKeywords
        .split(",")
        .map((k) => k.trim().toLowerCase());
      const foundKeywords = keywords.filter(
        (k) => k && textContent.toLowerCase().includes(k),
      );
      if (foundKeywords.length > 0) {
        reasons.push(`Blocked keywords: ${foundKeywords.join(", ")}`);
      }

      // Check for line breaks and average line length
      if (numLines > newlineThreshold) {
        const totalLength = lines.reduce(
          (acc, line) => acc + line.trim().length,
          0,
        );
        const avgLineLength = totalLength / numLines;
        if (avgLineLength < avgLineLengthThreshold) {
          reasons.push(`Low average line length: ${avgLineLength.toFixed(2)}`);
        }
      }

      // Check for sentences starting with emojis
      const sentences = textContent.split(/[.!?]/g);
      const emojiSentences = sentences.filter((s) => startsWithEmoji(s));
      if (emojiSentences.length >= emojiSentenceThreshold) {
        reasons.push(`Starts with ${emojiSentences.length} emoji sentences`);
      }

      // Check for content credentials label
      const credentialsLabel = post.querySelector(
        'label.a11y-text[for="content-credentials"]',
      );
      if (credentialsLabel) {
        reasons.push("Contains content credentials label");
      }

      let debugDiv = post.querySelector(".linkedin-post-filter-debug");
      if (!debugDiv) {
        debugDiv = document.createElement("div");
        debugDiv.className = "linkedin-post-filter-debug";
        post.appendChild(debugDiv);
      }

      debugDiv.innerHTML = `Newlines: ${numLines}<br>Reasons: ${reasons.join(", ") || "none"}`;

      const shouldHide = reasons.length > 0;

      if (shouldHide) {
        if (debugMode) {
          post.style.setProperty("background-color", "red", "important");
        } else {
          post.style.display = "none";
        }
      } else {
        post.style.backgroundColor = "";
        post.style.display = "";
      }
    }
  });
}

hidePosts();

// We also need to handle posts that are loaded dynamically as the user scrolls.
const observer = new MutationObserver(hidePosts);
const feedContainer = document.querySelector(
  ".scaffold-finite-scroll__content",
);
if (feedContainer) {
  observer.observe(feedContainer, { childList: true, subtree: false });
} else {
  // Fallback to observing the body if the feed container is not found
  observer.observe(document.body, { childList: true, subtree: false });
}
