# Milestone 3 Explorer 1: Message Item & Action Menus Analysis

## Executive Summary
This analysis establishes the architectural, accessibility, and interaction design specifications for `src/components/chat/message-item.tsx` under Milestone 3 of the Radiance AI platform. It details the transition from basic read-only message presentation to an interactive, accessible message component featuring a desktop hover/focus-within action toolbar, an accessible mobile action menu powered by `@radix-ui/react-dropdown-menu` with minimum 44x44px touch targets, sentiment rating feedback toggling, in-message error states with retry capability, inline user prompt editing, safe client-side Markdown export, and unit test specifications for `tests/unit/message-item.test.tsx`.

---

## 1. Existing Message Item Audit & Gap Analysis

### 1.1 Current Component Structure (`src/components/chat/message-item.tsx`)
The current implementation of `MessageItem` provides rudimentary rendering and limited interactions:
- **Props Interface** (lines 10–17):
  ```typescript
  interface MessageItemProps {
    message: ChatMessage;
    isStreaming?: boolean;
    followUps?: string[];
    onSelectFollowUp?: (q: string) => void;
    onRegenerate?: () => void;
    onEdit?: (text: string) => void;
  }
  ```
  **Gaps Identified**:
  1. Missing `onDelete?: (messageId: string) => void;` callback to connect with `useChatSession.deleteMessage`.
  2. Missing `onFeedback?: (messageId: string, feedback: FeedbackRating) => void;` callback to connect with `useChatSession.setMessageFeedback`.
  3. Missing `onRetry?: () => void;` callback to re-trigger failed message generation via `useChatStream.retryLast`.
  4. Lacks integration with `FeedbackRating` (`"positive" | "negative" | null`) defined in `src/lib/types/chat.ts`.

- **Container Geometry & Role Distinction** (lines 88–112):
  - Current outer wrapper:
    ```tsx
    <div className={`flex gap-3 max-w-3xl w-full mx-auto my-3.5 group transition-all duration-300 ${
      isUser ? "flex-row-reverse self-end" : "self-start"
    }`}>
    ```
  - Current bubble wrapper:
    ```tsx
    <div className="flex flex-col gap-1 max-w-[calc(100%-44px)]">
    ```
  **Gaps Identified**:
  1. For user messages, the bubble does not shrink-wrap around short prompts (`w-fit self-end max-w-[85%] sm:max-w-[75%]`) as specified in `PROJECT.md` Feature 2.
  2. For assistant messages, full container expansion (`w-full max-w-full sm:max-w-[90%]`) is required so complex markdown tables, LaTeX expressions, and code blocks have sufficient horizontal space.
  3. Lacks `min-w-0` on flex items, which risks flexbox blowout when preformatted code blocks or wide tables render.

- **Action Toolbar** (lines 191–250):
  - Current toolbar:
    ```tsx
    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
    ```
  **Gaps Identified**:
  1. **Keyboard Accessibility Violation (WCAG 2.1 AA 2.1.1 & 2.4.7)**: It uses only `group-hover:opacity-100`. When a keyboard-only user navigates via the `Tab` key, the toolbar remains invisible (`opacity-0`). It must include `group-focus-within:opacity-100 focus-within:opacity-100`.
  2. **Missing Actions**:
     - No Delete button.
     - No Feedback sentiment buttons (thumbs up / thumbs down).
     - No Retry button for error states.
     - No Safe client-side Markdown export button.
  3. **No Mobile Menu**: On touchscreen devices (where `:hover` is simulated or non-existent), the action bar is either inaccessible or clutters narrow mobile viewports.
  4. **Timestamp Accessibility**: Timestamp is rendered as an unadorned `<span className="tabular-nums">{formatRelativeTime(message.createdAt)}</span>`, lacking semantic `<time>`, `dateTime`, ISO tooltip, and accessible label.

- **Error State Handling**:
  - `ChatMessage` supports `isError?: boolean` and `errorDetails?: string`.
  - Currently, `MessageItem` treats error messages identically to normal assistant responses, causing broken markdown or missing feedback.
  - An in-message structured error card with an Alert icon and direct "Retry" button is needed to satisfy Feature 35 in `PROJECT.md`.

---

## 2. Desktop Hover Action Toolbar Design

### 2.1 Visibility & Keyboard Focus-Within
```tsx
className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity duration-200 hidden sm:flex items-center gap-1"
```
- **Rationale**:
  - `hidden sm:flex`: Hides the toolbar on mobile viewports (< 640px) in favor of the mobile dropdown menu.
  - `group-hover:opacity-100`: Reveals the toolbar smoothly on mouse hover.
  - `group-focus-within:opacity-100 focus-within:opacity-100`: Ensures that when a keyboard user presses `Tab` into any button within the message, the toolbar remains 100% visible, meeting WCAG 2.1 SC 2.1.1 (Keyboard) and SC 2.4.7 (Focus Visible).

### 2.2 Desktop Actions Inventory
1. **Copy Message (`data-testid="copy-message-button"`)**:
   - Copies `message.content` to clipboard via `navigator.clipboard.writeText(message.content)`.
   - Temporary visual confirmation: icon changes from `Copy` to `Check` (`text-[var(--success)]`) for 2000ms.
   - `aria-label={copied ? "Copied to clipboard" : "Copy message"}`.
2. **Text-to-Speech (Speech Synthesis)**:
   - For assistant messages (`!isUser && !message.isError`).
   - Uses Web Speech API with markdown symbols stripped (`message.content.replace(/[#*`_~\[\]()]/g, "")`).
   - `aria-label={isSpeaking ? "Stop speech" : "Read aloud"}`.
3. **Edit User Message (`data-testid="edit-message-button"`)**:
   - For user messages (`isUser && onEdit`).
   - Toggles inline editing mode (`isEditing: true`).
   - In edit mode, renders an accessible textarea with "Cancel" and "Save & Submit" buttons.
   - Keybindings: `Enter` (without Shift) triggers save & submit; `Escape` cancels.
4. **Regenerate Assistant Response (`data-testid="regenerate-message-button"`)**:
   - For assistant messages (`!isUser && !message.isError && onRegenerate && !isStreaming`).
   - Invokes `onRegenerate()`.
   - `aria-label="Regenerate response"`, `title="Regenerate response"`.
5. **Retry Failed Generation (`data-testid="retry-message-button"`)**:
   - For error messages (`message.isError && onRetry`).
   - Invokes `onRetry()`.
   - `aria-label="Retry generation"`, `title="Retry generation"`.
6. **Sentiment Rating Feedback (`data-testid="feedback-positive-button"`, `data-testid="feedback-negative-button"`)**:
   - For assistant messages (`!isUser && !message.isError && onFeedback`).
   - Thumbs Up:
     - Calls `onFeedback(message.id, "positive")`.
     - Active state: `text-[var(--accent)] fill-[var(--accent)]/20`, `aria-pressed={message.feedback === "positive"}`.
     - If clicked while already positive, toggles back to `null`.
   - Thumbs Down:
     - Calls `onFeedback(message.id, "negative")`.
     - Active state: `text-red-400 fill-red-400/20`, `aria-pressed={message.feedback === "negative"}`.
     - If clicked while already negative, toggles back to `null`.
7. **Safe Client-Side Export (`data-testid="export-message-button"`)**:
   - Available for all completed messages.
   - Generates client-side Markdown blob download (`URL.createObjectURL(blob)`).
   - `aria-label="Export message as Markdown"`, `title="Export Markdown"`.
8. **Delete Message (`data-testid="delete-message-button"`)**:
   - For both user and assistant messages when `onDelete` is provided.
   - Calls `onDelete(message.id)`.
   - `aria-label="Delete message"`, `title="Delete message"`.
9. **Semantic Timestamp Display (`data-testid="message-timestamp"`)**:
   - `<time dateTime={new Date(message.createdAt).toISOString()} title={new Date(message.createdAt).toISOString()} aria-label={`Sent at ${new Date(message.createdAt).toISOString()}`} className="tabular-nums ...">`.

---

## 3. Mobile Action Menu Design

### 3.1 Radix Primitives & Dependency Audit
- **Dependency Check**: `@radix-ui/react-dropdown-menu` version `^2.1.6` is installed in `package.json` and present in `node_modules/@radix-ui/react-dropdown-menu`.
- **Import Strategy**:
  ```typescript
  import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
  ```

### 3.2 Mobile Trigger & Touch Targets (WCAG 2.5.5 / 2.5.8)
- Displayed on mobile viewports (`sm:hidden flex items-center`).
- Trigger Button:
  ```tsx
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>
      <button
        type="button"
        className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg flex items-center justify-center text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-raised)] transition-colors touch-target focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        aria-label="Message actions"
        data-testid="mobile-action-menu-trigger"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </DropdownMenu.Trigger>
  ```
- Menu Content:
  - Rendered inside `<DropdownMenu.Portal>` and `<DropdownMenu.Content>`.
  - Glass-panel styling: `z-50 min-w-[210px] p-1.5 rounded-xl bg-[var(--deep)]/95 backdrop-blur-xl border border-[var(--border)] shadow-[0_12px_36px_rgba(0,0,0,0.6)] text-[var(--txt)]`.
  - Position: `sideOffset={6}`, `align={isUser ? "end" : "start"}`.
  - Every `<DropdownMenu.Item>` has `min-h-[44px]` with `touch-target` compliance:
    `className="min-h-[44px] flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer outline-none hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] text-[var(--txt)] transition-colors select-none"`.
- Menu Items:
  1. Copy (`data-testid="mobile-action-copy"`).
  2. Edit user message (`data-testid="mobile-action-edit"`).
  3. Regenerate assistant response (`data-testid="mobile-action-regenerate"`).
  4. Retry failed generation (`data-testid="mobile-action-retry"`).
  5. Thumbs Up feedback (`data-testid="mobile-action-feedback-positive"`).
  6. Thumbs Down feedback (`data-testid="mobile-action-feedback-negative"`).
  7. Export Markdown (.md) (`data-testid="mobile-action-export"`).
  8. Exact ISO Timestamp info item (`data-testid="mobile-timestamp-item"`).
  9. Delete message (`data-testid="mobile-action-delete"`).

---

## 4. Safe Client-Side Export Architecture

### 4.1 Pure Client-Side Implementation
```typescript
const handleExportMarkdown = () => {
  try {
    const filename = `radiance-message-${message.id || Date.now()}.md`;
    const blob = new Blob([message.content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    // Graceful fallback: clipboard copy if blob URL creation is restricted
    navigator.clipboard.writeText(message.content);
  }
};
```

### 4.2 Security Analysis & Invariants
1. **Zero External Communication**: Purely in-memory operations. No backend API request, no external URL shorteners, no telemetry leaks.
2. **Memory Leak Prevention**: `URL.revokeObjectURL(url)` immediately cleans up the allocated blob object from browser memory.
3. **Content-Security-Policy (CSP) Safe**: Uses `blob:` protocol for anchor download without requiring remote script injection or cross-origin downloads.
4. **Resilient Fallback**: If blob downloads are restricted by webview or sandbox flags, safely falls back to standard clipboard write.

---

## 5. Inline User Message Editing

### 5.1 UX & State Machine
1. When user clicks "Edit" (`data-testid="edit-message-button"` or `data-testid="mobile-action-edit"`), `isEditing` is set to `true`, initialized with `editContent = message.content`.
2. Inside the message bubble, the markdown preview is swapped for:
   - `<textarea className="w-full bg-[var(--deep)] border border-[var(--border)] rounded-lg p-2.5 text-xs text-[var(--txt)] focus:border-[var(--accent)] outline-none resize-y min-h-[80px]" data-testid="edit-message-textarea" />`
   - Actions footer:
     - "Cancel" button (`data-testid="cancel-edit-button"`): reverts `editContent` and sets `isEditing: false`.
     - "Save & Submit" button (`data-testid="save-edit-button"`): disables if empty, calls `onEdit?.(editContent.trim())`, and sets `isEditing: false`.
3. Keyboard accessibility:
   - Pressing `Enter` (without Shift) triggers save & submit.
   - Pressing `Escape` cancels editing.

---

## 6. Structured Error Card & Retry UI

When `message.isError === true`:
- The message bubble applies error-themed visual hierarchy:
  `bg-red-950/20 border-red-500/40 text-red-200 border-l-2 border-l-red-500`
- Displays error banner with `AlertCircle` icon:
  ```tsx
  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-red-400">
    <AlertCircle className="w-4 h-4 shrink-0" />
    <span>Generation failed</span>
  </div>
  ```
- Shows error details or content (`message.errorDetails || message.content`).
- Provides a prominent inline Retry button (`data-testid="error-retry-button"`):
  ```tsx
  {onRetry && (
    <div className="mt-3 pt-2.5 border-t border-red-500/20 flex items-center justify-end">
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 transition-colors"
        data-testid="error-retry-button"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Retry generation</span>
      </button>
    </div>
  )}
  ```

---

## 7. ChatWorkspace & Hook Wiring Specification

### 7.1 Proposed `MessageItemProps` Interface
```typescript
export interface MessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
  followUps?: string[];
  onSelectFollowUp?: (q: string) => void;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: FeedbackRating) => void;
  onRetry?: () => void;
}
```

### 7.2 Integration in `src/features/chat/components/chat-workspace.tsx`
Update `ChatWorkspaceProps` to accept the action handlers:
```typescript
interface ChatWorkspaceProps {
  messages: ChatMessage[];
  streamingContent: string;
  isGenerating: boolean;
  activeFollowUps: string[];
  onSend: (text: string, attachments?: Attachment[]) => void;
  onStop: () => void;
  onSelectSuggestion: (text: string) => void;
  onOpenSettings: () => void;
  onRegenerate?: () => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onFeedbackMessage?: (messageId: string, feedback: FeedbackRating) => void;
  onRetryMessage?: () => void;
}
```
And wire down to `MessageItem`:
```tsx
{messages.map((msg) => (
  <MessageItem
    key={msg.id}
    message={msg}
    onRegenerate={onRegenerate}
    onEdit={onEditMessage ? (newContent) => onEditMessage(msg.id, newContent) : undefined}
    onDelete={onDeleteMessage ? () => onDeleteMessage(msg.id) : undefined}
    onFeedback={onFeedbackMessage ? (feedback) => onFeedbackMessage(msg.id, feedback) : undefined}
    onRetry={onRetryMessage}
  />
))}
```

---

## 8. Unit Test Specifications for `tests/unit/message-item.test.tsx`

The unit test suite will be structured into 7 test suites containing at least 20 focused test cases:

1. **Suite 1: Role Presentation & Container Geometry**
   - Renders user message with `YOU` avatar, right-aligned styling (`flex-row-reverse`), user theme colors, and shrink-wrapped width.
   - Renders assistant message with `RD` avatar, left-aligned styling, assistant theme borders, and expanded width.
   - Renders streaming cursor indicator when `isStreaming: true`.
2. **Suite 2: Timestamp & Semantic Accessibility**
   - Renders `<time>` element with `dateTime` and `title` attributes matching the exact ISO 8601 string.
   - Formats relative time via `formatRelativeTime` with `tabular-nums`.
3. **Suite 3: Clipboard Copy & Visual Feedback**
   - Invokes `navigator.clipboard.writeText` with message content.
   - Toggles icon to `Check` and label to "Copied to clipboard" for 2000ms.
4. **Suite 4: User Message Editing**
   - Edit button is rendered for user messages and hidden for assistant messages.
   - Clicking Edit opens inline textarea initialized with message content.
   - Clicking Cancel closes edit mode without modifying text.
   - Modifying text and clicking Save & Submit invokes `onEdit` with trimmed new content.
   - Keydown `Enter` without Shift invokes `onEdit`; keydown `Escape` cancels.
5. **Suite 5: Assistant Regenerate, Retry & Error State**
   - Regenerate button is rendered for assistant messages and hidden for user messages.
   - Invokes `onRegenerate` when clicked.
   - Renders structured error card with red alert styling when `message.isError === true`.
   - Clicking inline retry or toolbar retry invokes `onRetry`.
6. **Suite 6: Feedback Sentiment Rating**
   - Thumbs up button calls `onFeedback` with `"positive"`, sets `aria-pressed="true"`, and applies active tint.
   - Thumbs down button calls `onFeedback` with `"negative"`, sets `aria-pressed="true"`, and applies red tint.
   - Clicking already active sentiment calls `onFeedback` with `null` (toggle behavior).
7. **Suite 7: Safe Client-Side Export & Mobile Menu**
   - Export button creates Markdown blob, triggers download without remote API calls, and revokes object URL.
   - Delete button calls `onDelete` with `message.id`.
   - Mobile menu trigger button has minimum 44x44px touch target.
   - Mobile dropdown items have `min-h-[44px]` touch targets.
   - Desktop toolbar contains `focus-within:opacity-100` and `group-focus-within:opacity-100`.
