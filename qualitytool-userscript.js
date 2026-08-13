// ==UserScript==
// @name         MCServerHost QTool
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  MCServerHost Quality Tool: Reworked element to have necessary feature. Made with assistance by DeepSeek.
// @author       wallobor
// @match        https://www.mcserverhost.com/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    // #########################
    // STYLES
    // #########################
    GM_addStyle(`
        /* ---------- Toggle button ---------- */
        #mcs-toggle-btn {
            position: fixed;
            bottom: 24px;
            right: 120px;
            width: 48px;
            height: 48px;
            background: #1AD76F;
            border: none;
            border-radius: 50%;
            box-shadow: 0 4px 16px rgba(26,215,111,0.4);
            cursor: pointer;
            z-index: 100000;
            font-size: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, box-shadow 0.2s;
            color: #000;
        }
        #mcs-toggle-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 24px rgba(26,215,111,0.6);
        }
        #mcs-toggle-btn.active {
            background: #333;
            box-shadow: 0 4px 16px rgba(0,0,0,0.4);
            color: #fff;
        }

        /* ---------- Main panel ---------- */
        #mcs-turbo-panel {
            position: fixed;
            width: 360px;
            max-height: calc(100vh - 120px);
            overflow-y: auto;
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.7);
            z-index: 99999;
            color: #ddd;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 13px;
            user-select: none;
            cursor: default;
            right: auto;
            bottom: auto;
        }
        #mcs-turbo-panel .drag-handle {
            cursor: grab;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }
        #mcs-turbo-panel .drag-handle:active {
            cursor: grabbing;
        }
        #mcs-turbo-panel .drag-handle h2 {
            margin: 0;
            color: #1AD76F;
            font-size: 16px;
            font-weight: 600;
            pointer-events: none;
            flex: 1;
        }
        #mcs-turbo-panel .drag-handle .header-btn {
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
            font-size: 16px;
            padding: 0 6px;
            transition: color 0.2s;
        }
        #mcs-turbo-panel .drag-handle .header-btn:hover {
            color: #fff;
        }
        #mcs-turbo-panel .drag-handle .close-btn {
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
            font-size: 18px;
            padding: 0 4px;
        }
        #mcs-turbo-panel .drag-handle .close-btn:hover {
            color: #fff;
        }

        /* Tab bar */
        #mcs-turbo-panel .tab-bar {
            display: flex;
            gap: 4px;
            margin-bottom: 12px;
            border-bottom: 1px solid #333;
            padding-bottom: 6px;
        }
        #mcs-turbo-panel .tab-bar .tab-btn {
            background: transparent;
            border: none;
            color: #888;
            padding: 4px 12px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            border-radius: 4px 4px 0 0;
            transition: background 0.2s, color 0.2s;
        }
        #mcs-turbo-panel .tab-bar .tab-btn:hover {
            background: #2a2a2a;
            color: #ccc;
        }
        #mcs-turbo-panel .tab-bar .tab-btn.active {
            color: #1AD76F;
            background: #2a2a2a;
        }

        /* Tab content */
        #mcs-turbo-panel .tab-content {
            display: none;
        }
        #mcs-turbo-panel .tab-content.active {
            display: block;
        }

        /* General styles */
        #mcs-turbo-panel .field-group {
            margin-bottom: 10px;
        }
        #mcs-turbo-panel label {
            display: block;
            font-size: 11px;
            font-weight: 500;
            color: #aaa;
            margin-bottom: 2px;
        }
        #mcs-turbo-panel input, #mcs-turbo-panel textarea {
            width: 100%;
            padding: 6px 8px;
            background: #0d0d0d;
            border: 1px solid #333;
            border-radius: 6px;
            color: #eee;
            font-size: 12px;
            box-sizing: border-box;
            font-family: inherit;
        }
        #mcs-turbo-panel textarea {
            resize: vertical;
            min-height: 60px;
            line-height: 1.4;
        }
        #mcs-turbo-panel input:focus, #mcs-turbo-panel textarea:focus {
            outline: none;
            border-color: #1AD76F;
        }
        #mcs-turbo-panel .row {
            display: flex;
            gap: 8px;
        }
        #mcs-turbo-panel .row .field-group {
            flex: 1;
        }
        #mcs-turbo-panel .captcha-row {
            display: flex;
            gap: 6px;
        }
        #mcs-turbo-panel .captcha-row input {
            flex: 1;
        }
        #mcs-turbo-panel .captcha-row button {
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 6px;
            color: #ccc;
            padding: 0 12px;
            cursor: pointer;
            font-size: 12px;
            white-space: nowrap;
        }
        #mcs-turbo-panel .captcha-row button:hover {
            background: #333;
        }
        /* Rows for token, UUID, node */
        #mcs-turbo-panel .token-row,
        #mcs-turbo-panel .uuid-row,
        #mcs-turbo-panel .node-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #0d0d0d;
            border: 1px solid #333;
            border-radius: 6px;
            padding: 4px 8px;
            margin-top: 8px;
        }
        #mcs-turbo-panel .token-row .token-preview,
        #mcs-turbo-panel .uuid-row .uuid-preview,
        #mcs-turbo-panel .node-row .node-preview {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #ffb;
            max-width: 180px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: default;
        }
        #mcs-turbo-panel .token-row .token-preview.loaded,
        #mcs-turbo-panel .uuid-row .uuid-preview.loaded,
        #mcs-turbo-panel .node-row .node-preview.loaded {
            border-color: #4caf50;
        }
        #mcs-turbo-panel .token-row .btn-copy,
        #mcs-turbo-panel .uuid-row .btn-copy,
        #mcs-turbo-panel .node-row .btn-copy {
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 2px 12px;
            font-weight: 600;
            font-size: 11px;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        #mcs-turbo-panel .token-row .btn-copy:hover,
        #mcs-turbo-panel .uuid-row .btn-copy:hover,
        #mcs-turbo-panel .node-row .btn-copy:hover {
            background: #1976D2;
        }
        #mcs-turbo-panel .token-row .btn-copy:disabled,
        #mcs-turbo-panel .uuid-row .btn-copy:disabled,
        #mcs-turbo-panel .node-row .btn-copy:disabled {
            background: #444;
            cursor: not-allowed;
            opacity: 0.5;
        }
        #mcs-turbo-panel .submit-btn {
            width: 100%;
            padding: 10px;
            background: #1AD76F;
            border: none;
            border-radius: 8px;
            color: #000;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            margin-top: 8px;
            transition: background 0.2s;
        }
        #mcs-turbo-panel .submit-btn:hover {
            background: #15c462;
        }
        #mcs-turbo-panel .submit-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        #mcs-turbo-panel .bottom-actions {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }
        #mcs-turbo-panel .bottom-actions button {
            flex: 1;
            padding: 8px;
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 6px;
            color: #ccc;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s;
        }
        #mcs-turbo-panel .bottom-actions button:hover {
            background: #333;
        }
        #mcs-turbo-panel .bottom-actions .open-page-btn {
            background: #3b3b3b;
            border-color: #555;
        }
        #mcs-turbo-panel .bottom-actions .open-page-btn:hover {
            background: #4a4a4a;
        }
        #mcs-turbo-panel .bottom-actions .backup-btn {
            background: #9b59b6;
            border-color: #8e44ad;
        }
        #mcs-turbo-panel .bottom-actions .backup-btn:hover {
            background: #8e44ad;
        }
        #mcs-turbo-panel .status-area {
            margin-top: 12px;
            background: #0d0d0d;
            border: 1px solid #222;
            border-radius: 6px;
            padding: 8px;
            max-height: 150px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 11px;
            color: #aaa;
            white-space: pre-wrap;
            word-break: break-all;
        }
        #mcs-turbo-panel .status-area.success {
            color: #1AD76F;
        }
        #mcs-turbo-panel .status-area.error {
            color: #ff6b6b;
        }
        #mcs-turbo-panel .token-status {
            font-size: 10px;
            color: #888;
            margin-top: 2px;
        }
        #mcs-turbo-panel .token-status.ok {
            color: #1AD76F;
        }
        #mcs-turbo-panel .uuid-fetch-row {
            display: flex;
            gap: 6px;
            margin-top: 4px;
        }
        #mcs-turbo-panel .uuid-fetch-row button {
            background: #2a2a2a;
            border: 1px solid #444;
            border-radius: 6px;
            color: #ccc;
            padding: 0 12px;
            cursor: pointer;
            font-size: 11px;
            white-space: nowrap;
        }
        #mcs-turbo-panel .uuid-fetch-row button:hover {
            background: #333;
        }

        #mcs-turbo-panel.hidden {
            display: none !important;
        }

        /* ---------- Terminal styles ---------- */
        .mcs-terminal-wrapper {
            display: flex;
            flex-direction: column;
            height: 750px;
            min-height: 500px;
            background: #0d0d0d;
            border-radius: 12px;
            border: 1px solid #2a2a2a;
            padding: 6px;
            overflow: hidden;
        }
        .mcs-terminal-status {
            color: #aaa;
            font-size: 12px;
            padding: 4px 8px;
            background: #181818;
            border-radius: 6px 6px 0 0;
            border-bottom: 1px solid #2a2a2a;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
        }
        .mcs-terminal-status .dot {
            display: inline-block;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            margin-right: 6px;
        }
        .mcs-terminal-status .dot.connected {
            background: #4caf50;
            box-shadow: 0 0 8px #4caf50;
        }
        .mcs-terminal-status .dot.disconnected {
            background: #f44336;
            box-shadow: 0 0 8px #f44336;
        }
        .mcs-terminal-status .status-text {
            display: inline-flex;
            align-items: center;
        }
        .mcs-terminal-status .mcs-copy-logs-btn {
            background: none;
            border: none;
            color: #888;
            cursor: pointer;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: 500;
            border-radius: 4px;
            transition: background 0.15s, color 0.15s;
        }
        .mcs-terminal-status .mcs-copy-logs-btn:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }
        .mcs-terminal-status .mcs-copy-logs-btn:disabled {
            opacity: 0.3;
            cursor: not-allowed;
            pointer-events: none;
        }
        .mcs-terminal-status .mcs-copy-logs-btn:active {
            transform: scale(0.95);
        }
        .mcs-terminal-status .mcs-term-info {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #555;
        }
        .mcs-terminal-output {
            flex: 1;
            background: #0a0a0a;
            border-radius: 6px;
            overflow: hidden;
            min-height: 0;
        }
        .mcs-terminal-output .xterm {
            height: 100% !important;
            width: 100% !important;
        }
        .mcs-terminal-input-row {
            display: flex;
            gap: 8px;
            padding: 6px 4px;
            background: #181818;
            border-top: 1px solid #2a2a2a;
            flex-shrink: 0;
        }
        .mcs-terminal-input-row input {
            flex: 1;
            background: #0d0d0d;
            color: #d4d4d4;
            border: 1px solid #444;
            border-radius: 6px;
            padding: 6px 10px;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            outline: none;
            /* Disable autocomplete/password manager */
            autocomplete: off;
            autocorrect: off;
            autocapitalize: off;
            data-lpignore: true;
        }
        .mcs-terminal-input-row input:focus {
            border-color: #888;
        }
        .mcs-terminal-input-row input:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        .mcs-terminal-input-row button {
            background: #1565c0;
            border: none;
            border-radius: 6px;
            color: #fff;
            padding: 6px 16px;
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .mcs-terminal-input-row button:hover:not(:disabled) {
            background: #1e88e5;
        }
        .mcs-terminal-input-row button:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }

        /* ---------- Power buttons ---------- */
        .mcs-custom-power-wrapper {
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255,255,255,0.05);
        }
        .mcs-power-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
        }
        .mcs-power-grid button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 10px;
            background: transparent;
            border: 1px solid rgba(255,255,255,0.08);
            border-radius: 8px;
            color: #9ca3af;
            font-size: 12px;
            font-weight: 600;
            transition: all 0.15s ease;
            cursor: pointer;
        }
        .mcs-power-grid button:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
            border-color: rgba(255,255,255,0.2);
        }
        .mcs-power-grid button:active {
            transform: scale(0.96);
        }
        .mcs-power-grid button svg {
            width: 14px;
            height: 14px;
            stroke: currentColor;
            fill: none;
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .mcs-power-status {
            margin-top: 6px;
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.06);
            border-radius: 6px;
            padding: 4px 8px;
            font-family: monospace;
            font-size: 11px;
            color: #aaa;
            min-height: 20px;
            max-height: 40px;
            overflow-y: auto;
            word-break: break-all;
            transition: color 0.2s;
        }
        .mcs-power-status.success {
            color: #81c784;
        }
        .mcs-power-status.error {
            color: #ef9a9a;
        }
        .mcs-power-status.info {
            color: #90caf9;
        }

        /* ---------- Spin Wheel ---------- */
        .mcs-spin-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 4px 0;
        }
        .mcs-spin-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .mcs-spin-stat-card {
            background: #1a1508;
            border: 1px solid #b8860b44;
            border-radius: 8px;
            padding: 8px 12px;
            text-align: center;
        }
        .mcs-spin-stat-card .stat-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #b8860b;
            font-weight: 600;
        }
        .mcs-spin-stat-card .stat-value {
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: 700;
            color: #f5d742;
            margin-top: 2px;
        }
        .mcs-spin-status {
            background: #1a1508;
            border: 1px solid #b8860b44;
            border-radius: 8px;
            padding: 8px 12px;
            text-align: center;
            font-size: 13px;
            color: #ccc;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .mcs-spin-status .can-spin {
            color: #4caf50;
            font-weight: 600;
        }
        .mcs-spin-status .cannot-spin {
            color: #ff6b6b;
            font-weight: 600;
        }
        .mcs-spin-status .countdown {
            color: #f5d742;
            font-family: 'Courier New', monospace;
            font-size: 16px;
            font-weight: 700;
        }
        .mcs-spin-refresh-btn {
            background: transparent;
            border: 1px solid #444;
            color: #aaa;
            padding: 2px 10px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.15s;
            white-space: nowrap;
        }
        .mcs-spin-refresh-btn:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }
        .mcs-spin-btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(145deg, #d4a017, #b8860b);
            border: 2px solid #f5d742;
            border-radius: 12px;
            color: #1a1a1a;
            font-weight: 800;
            font-size: 20px;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.15s ease;
            box-shadow: 0 0 20px rgba(184, 134, 11, 0.3);
            text-shadow: 0 1px 2px rgba(255, 215, 0, 0.3);
        }
        .mcs-spin-btn:hover:not(:disabled) {
            transform: scale(1.02);
            box-shadow: 0 0 30px rgba(184, 134, 11, 0.6);
            background: linear-gradient(145deg, #e8b830, #c9960e);
        }
        .mcs-spin-btn:active:not(:disabled) {
            transform: scale(0.96);
        }
        .mcs-spin-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            box-shadow: none;
            filter: grayscale(0.5);
        }
        .mcs-spin-result {
            background: #1a1508;
            border: 1px solid #b8860b44;
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 13px;
            color: #ccc;
            min-height: 36px;
            text-align: center;
            word-break: break-all;
        }
        .mcs-spin-result.success {
            border-color: #4caf50;
            color: #81c784;
        }
        .mcs-spin-result.error {
            border-color: #f44336;
            color: #ef9a9a;
        }
        .mcs-spin-result .reward-tier {
            color: #f5d742;
            font-weight: 700;
        }
        .mcs-spin-result .reward-credits {
            color: #4caf50;
            font-weight: 700;
        }
        .mcs-spin-result .reward-usd {
            color: #81c784;
            font-weight: 700;
        }

        /* ---------- Terminal placeholder ---------- */
        .mcs-terminal-placeholder {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            min-height: 200px;
            background: #0d0d0d;
            border-radius: 8px;
            flex-direction: column;
            gap: 12px;
            color: #888;
        }
        .mcs-terminal-placeholder button {
            background: #2a2a2a;
            border: 1px solid #444;
            color: #ccc;
            padding: 8px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background 0.15s;
        }
        .mcs-terminal-placeholder button:hover {
            background: #3a3a3a;
            color: #fff;
        }

        /* ---------- Custom File Explorer (in‑page) ---------- */
        .mcs-page-explorer {
            background: #0d0d0d;
            border: 1px solid #2a2a2a;
            border-radius: 12px;
            margin: 12px 0;
            display: flex;
            flex-direction: column;
            min-height: 200px;
            overflow: hidden;
            scrollbar-width: none;
        }
        .mcs-page-explorer .explorer-path {
            display: flex;
            align-items: center;
            padding: 8px 12px;
            background: #181818;
            border-bottom: 1px solid #2a2a2a;
            gap: 6px;
            flex-wrap: wrap;
            min-height: 40px;
            flex-shrink: 0;
        }
        .mcs-page-explorer .explorer-path .path-segment {
            cursor: pointer;
            color: #90caf9;
        }
        .mcs-page-explorer .explorer-path .path-segment:hover {
            text-decoration: underline;
        }
        .mcs-page-explorer .explorer-path .path-sep {
            color: #666;
            margin: 0 2px;
        }
        .mcs-page-explorer .explorer-path .path-root {
            color: #1AD76F;
            font-weight: 600;
            cursor: pointer;
        }
        .mcs-page-explorer .explorer-path .path-root:hover {
            text-decoration: underline;
        }
        .mcs-page-explorer .explorer-path .path-home {
            cursor: pointer;
            font-size: 18px;
            margin-right: 4px;
        }
        .mcs-page-explorer .explorer-path .path-home:hover {
            text-decoration: underline;
        }
        .mcs-page-explorer .explorer-path .path-counter {
            margin-left: auto;
            color: #666;
            font-size: 11px;
        }
        .mcs-page-explorer .explorer-toolbar {
            display: flex;
            gap: 6px;
            padding: 6px 12px;
            background: #181818;
            border-bottom: 1px solid #2a2a2a;
            flex-wrap: wrap;
            flex-shrink: 0;
            align-items: center;
        }
        .mcs-page-explorer .explorer-toolbar .toolbar-left {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .mcs-page-explorer .explorer-toolbar .toolbar-right {
            display: flex;
            align-items: center;
            gap: 6px;
            margin-left: auto;
        }
        .mcs-page-explorer .explorer-toolbar button {
            background: #2a2a2a;
            border: 1px solid #444;
            color: #ccc;
            padding: 4px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-family: inherit;
            transition: background 0.15s, border-color 0.15s;
        }
        .mcs-page-explorer .explorer-toolbar button:hover {
            background: #3a3a3a;
            color: #fff;
        }
        .mcs-page-explorer .explorer-toolbar .btn-upload {
            border-color: #2e7d32;
            color: #81c784;
        }
        .mcs-page-explorer .explorer-toolbar .btn-upload:hover {
            background: #1b5e20;
            border-color: #4caf50;
        }
        .mcs-page-explorer .explorer-toolbar .btn-mkdir {
            border-color: #1565c0;
            color: #64b5f6;
        }
        .mcs-page-explorer .explorer-toolbar .btn-mkdir:hover {
            background: #0d47a1;
            border-color: #42a5f5;
        }
        .mcs-page-explorer .explorer-toolbar .btn-delete {
            border-color: #b71c1c;
            color: #ef9a9a;
        }
        .mcs-page-explorer .explorer-toolbar .btn-delete:hover {
            background: #8b0000;
            border-color: #f44336;
        }
        .mcs-page-explorer .explorer-toolbar .btn-rename {
            border-color: #e65100;
            color: #ffb74d;
        }
        .mcs-page-explorer .explorer-toolbar .btn-rename:hover {
            background: #bf360c;
            border-color: #ff9800;
        }
        .mcs-page-explorer .explorer-toolbar .btn-refresh {
            border-color: #444;
            color: #aaa;
        }
        .mcs-page-explorer .explorer-toolbar .btn-refresh:hover {
            background: #333;
            border-color: #666;
        }
        .mcs-page-explorer .explorer-status {
            color: #90caf9;
            font-size: 11px;
            padding: 0 4px;
        }
        .mcs-page-explorer .explorer-list {
            flex: 1;
            overflow-y: auto;
            padding: 4px 8px;
            min-height: 0;
            user-select: none;
        }
        .mcs-page-explorer .explorer-item {
            display: flex;
            align-items: center;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            transition: background 0.15s;
            gap: 10px;
            border-bottom: 1px solid #1a1a1a;
            user-select: none;
        }
        .mcs-page-explorer .explorer-item:hover {
            background: #2a2a2a;
        }
        .mcs-page-explorer .explorer-item.selected {
            background: #2a4a2a;
        }
        .mcs-page-explorer .explorer-item .item-icon {
            font-size: 18px;
            width: 24px;
            text-align: center;
        }
        .mcs-page-explorer .explorer-item .item-name {
            flex: 1;
            font-weight: 400;
            color: #ddd;
            word-break: break-word;
            user-select: none;
        }
        .mcs-page-explorer .explorer-item.folder .item-name {
            color: #90caf9;
            font-weight: 600;
        }
        .mcs-page-explorer .explorer-item .item-size,
        .mcs-page-explorer .explorer-item .item-date {
            color: #666;
            font-size: 12px;
            min-width: 80px;
            text-align: right;
            user-select: none;
        }
        .mcs-page-explorer .explorer-item .item-date {
            min-width: 140px;
        }
        .mcs-page-explorer .explorer-item .item-checkbox {
            margin-right: 4px;
            cursor: pointer;
        }
        .mcs-page-explorer .explorer-item label {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            flex: 1;
            user-select: none;
        }
        .mcs-page-explorer .explorer-empty {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .mcs-page-explorer .explorer-loading {
            text-align: center;
            padding: 40px;
            color: #666;
        }
        .mcs-page-explorer .explorer-error {
            text-align: center;
            padding: 40px;
            color: #ef9a9a;
        }
        /* Resize handle */
        .mcs-page-explorer .explorer-resize-handle {
            height: 8px;
            background: #181818;
            border-top: 1px solid #2a2a2a;
            cursor: ns-resize;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .mcs-page-explorer .explorer-resize-handle::after {
            content: '⋯';
            color: #555;
            font-size: 14px;
            letter-spacing: 4px;
        }
        #mcs-context-menu button:hover {
            background: #2a2a2a;
        }
    `);

    // #########################
    // BUILD UI (Files tab removed)
    // #########################
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'mcs-toggle-btn';
    toggleBtn.textContent = '🚀';
    toggleBtn.title = 'MCSH QTool';
    document.body.appendChild(toggleBtn);

    const panel = document.createElement('div');
    panel.id = 'mcs-turbo-panel';
    panel.innerHTML = `
        <div class="drag-handle">
            <h2>🚀 MCSH QTool</h2>
            <button class="header-btn" id="mcs-refresh-all" title="Refresh captcha, token &amp; UUID">⟳</button>
            <button class="close-btn" id="mcs-close-panel">✕</button>
        </div>
        <div class="tab-bar">
            <button class="tab-btn active" data-tab="server">Server</button>
            <button class="tab-btn" data-tab="data">Data</button>
            <button class="tab-btn" data-tab="backup">Backup</button>
            <button class="tab-btn" data-tab="spin">💰 Spin</button>
        </div>

        <!-- Server Tab -->
        <div class="tab-content active" id="tab-server">
            <div class="field-group">
                <label>Server Name</label>
                <input id="mcs-server-name" value="..." />
            </div>
            <div class="field-group">
                <label>Description</label>
                <input id="mcs-description" value="Just a server" />
            </div>
            <div class="field-group">
                <label>Subdomain</label>
                <input id="mcs-subdomain" value="..." />
            </div>
            <div class="row">
                <div class="field-group">
                    <label>Location ID (3/21/23 = UK/SG/US)</label>
                    <input id="mcs-location-id" type="number" value="21" />
                </div>
                <div class="field-group">
                    <label>Egg ID</label>
                    <input id="mcs-egg-id" type="number" value="107" />
                </div>
            </div>
            <div class="row">
                <div class="field-group">
                    <label>Version</label>
                    <input id="mcs-version" value="1.21.11" />
                </div>
                <div class="field-group">
                    <label>Docker Image</label>
                    <input id="mcs-docker-image" value="Java 25" />
                </div>
            </div>
            <div class="field-group">
                <label>Captcha Token</label>
                <div class="captcha-row">
                    <input id="mcs-captcha-token" placeholder="Auto-filled after solving" />
                    <button id="mcs-refresh-captcha">⟳ Refresh</button>
                </div>
                <div id="mcs-token-status" class="token-status">Waiting for Turnstile...</div>
            </div>
            <button id="mcs-submit-btn" class="submit-btn">Create Server</button>
            <div class="bottom-actions">
                <button class="open-page-btn" id="mcs-open-page">🌐 Open Create Server Page</button>
            </div>
        </div>

        <!-- Data Tab -->
        <div class="tab-content" id="tab-data">
            <div class="token-row">
                <span style="color:#666; font-size:10px;">🔑 Token</span>
                <span class="token-preview" id="mct-preview">No token</span>
                <button class="btn-copy" id="mct-copy-btn" disabled>📋 Copy</button>
            </div>
            <div style="margin-top: 12px;">
                <label style="color:#aaa; font-size:11px;">Server UUID (from current page)</label>
                <div class="uuid-row">
                    <span class="uuid-preview" id="mcs-uuid-preview">Not on server page</span>
                    <button class="btn-copy" id="mcs-uuid-copy-btn" disabled>📋 Copy</button>
                </div>
                <div class="uuid-fetch-row">
                    <button id="mcs-fetch-uuid">⟳ Fetch UUID</button>
                </div>
            </div>
            <div style="margin-top: 12px;">
                <label style="color:#aaa; font-size:11px;">Node Information</label>
                <div class="node-row">
                    <span style="color:#666; font-size:10px;">🖥️ Node ID</span>
                    <span class="node-preview" id="mcs-node-id-preview">N/A</span>
                    <button class="btn-copy" id="mcs-node-id-copy-btn" disabled>📋 Copy</button>
                </div>
                <div class="node-row" style="margin-top: 4px;">
                    <span style="color:#666; font-size:10px;">🏷️ Node Name</span>
                    <span class="node-preview" id="mcs-node-name-preview">N/A</span>
                    <button class="btn-copy" id="mcs-node-name-copy-btn" disabled>📋 Copy</button>
                </div>
            </div>
        </div>

        <!-- Backup Tab -->
        <div class="tab-content" id="tab-backup">
            <div class="field-group">
                <label>Files to backup (comma separated)</label>
                <textarea id="mcs-backup-files" rows="3" wrap="soft">arena-0-backup, plugins, spawn, .console_history, banned-ips.json, banned-players.json, bukkit.yml, commands.yml, config.yml, eula.txt, help.yml, ops.json, permissions.yml, server.properties, spigot.yml, usercache.json, velocity.toml, version_history.json, wepif.yml, whitelist.json</textarea>
            </div>
            <button class="backup-btn" id="mcs-backup-btn" style="width:100%; padding:10px; background:#9b59b6; border:none; border-radius:8px; color:#fff; font-weight:600; font-size:14px; cursor:pointer; margin-top:8px;">💾 Backup Server</button>
        </div>

        <!-- Spin Tab -->
        <div class="tab-content" id="tab-spin">
            <div class="mcs-spin-container">
                <div class="mcs-spin-stats" id="mcs-spin-stats">
                    <div class="mcs-spin-stat-card">
                        <div class="stat-label">Spins</div>
                        <div class="stat-value" id="mcs-spin-total">--</div>
                    </div>
                    <div class="mcs-spin-stat-card">
                        <div class="stat-label">Won Credits</div>
                        <div class="stat-value" id="mcs-spin-credits">--</div>
                    </div>
                    <div class="mcs-spin-stat-card">
                        <div class="stat-label">Won USD</div>
                        <div class="stat-value" id="mcs-spin-usd">--</div>
                    </div>
                    <div class="mcs-spin-stat-card">
                        <div class="stat-label">Next Spin</div>
                        <div class="stat-value" id="mcs-spin-countdown" style="font-size:14px;">--</div>
                    </div>
                </div>

                <div class="mcs-spin-status" id="mcs-spin-status">
                    <span id="mcs-spin-can">Loading...</span>
                    <button class="mcs-spin-refresh-btn" id="mcs-spin-refresh">⟳ Refresh</button>
                </div>

                <button class="mcs-spin-btn" id="mcs-spin-btn" disabled>🎰 SPIN!</button>

                <div class="mcs-spin-result" id="mcs-spin-result">Ready to spin!</div>
            </div>
        </div>

        <div id="mcs-status-area" class="status-area"> </div>
    `;
    document.body.appendChild(panel);

    // #########################
    // REFERENCES
    // #########################
    const serverNameInput = document.getElementById('mcs-server-name');
    const descInput = document.getElementById('mcs-description');
    const subdomainInput = document.getElementById('mcs-subdomain');
    const locationInput = document.getElementById('mcs-location-id');
    const eggInput = document.getElementById('mcs-egg-id');
    const versionInput = document.getElementById('mcs-version');
    const dockerInput = document.getElementById('mcs-docker-image');
    const captchaInput = document.getElementById('mcs-captcha-token');
    const tokenStatus = document.getElementById('mcs-token-status');
    const submitBtn = document.getElementById('mcs-submit-btn');
    const statusArea = document.getElementById('mcs-status-area');
    const refreshBtn = document.getElementById('mcs-refresh-captcha');
    const closeBtn = document.getElementById('mcs-close-panel');

    // Token copier
    const tokenPreview = document.getElementById('mct-preview');
    const copyBtn = document.getElementById('mct-copy-btn');

    // UUID elements
    const uuidPreview = document.getElementById('mcs-uuid-preview');
    const uuidCopyBtn = document.getElementById('mcs-uuid-copy-btn');
    const fetchUuidBtn = document.getElementById('mcs-fetch-uuid');

    // Node elements
    const nodeIdPreview = document.getElementById('mcs-node-id-preview');
    const nodeIdCopyBtn = document.getElementById('mcs-node-id-copy-btn');
    const nodeNamePreview = document.getElementById('mcs-node-name-preview');
    const nodeNameCopyBtn = document.getElementById('mcs-node-name-copy-btn');

    // Backup
    const backupFilesInput = document.getElementById('mcs-backup-files');
    const backupBtn = document.getElementById('mcs-backup-btn');

    // Open page
    const openPageBtn = document.getElementById('mcs-open-page');

    // Refresh all
    const refreshAllBtn = document.getElementById('mcs-refresh-all');

    // Spin elements
    const spinTotal = document.getElementById('mcs-spin-total');
    const spinCredits = document.getElementById('mcs-spin-credits');
    const spinUsd = document.getElementById('mcs-spin-usd');
    const spinCountdown = document.getElementById('mcs-spin-countdown');
    const spinCan = document.getElementById('mcs-spin-can');
    const spinBtn = document.getElementById('mcs-spin-btn');
    const spinResult = document.getElementById('mcs-spin-result');
    const spinRefreshBtn = document.getElementById('mcs-spin-refresh');

    // Tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = {
        server: document.getElementById('tab-server'),
        data: document.getElementById('tab-data'),
        backup: document.getElementById('tab-backup'),
        spin: document.getElementById('tab-spin')
    };

    // #########################
    // POSITION MANAGEMENT
    // #########################
    const POSITION_KEY = 'mcsPanelPosition';

    function applyPosition(centerXPercent, topPercent) {
        centerXPercent = Math.max(0, Math.min(100, centerXPercent));
        topPercent = Math.max(0, Math.min(100, topPercent));

        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const panelWidth = panel.offsetWidth || 360;
        const panelHeight = panel.offsetHeight || 400;

        let left = (centerXPercent / 100) * viewportWidth - panelWidth / 2;
        let top = (topPercent / 100) * viewportHeight;

        left = Math.max(0, Math.min(left, viewportWidth - panelWidth));
        top = Math.max(0, Math.min(top, viewportHeight - panelHeight));

        panel.style.left = left + 'px';
        panel.style.top = top + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';

        localStorage.setItem(POSITION_KEY, JSON.stringify({
            centerXPercent: centerXPercent,
            topPercent: topPercent
        }));
    }

    function loadPanelPosition() {
        try {
            const data = JSON.parse(localStorage.getItem(POSITION_KEY));
            if (data) {
                let centerXPercent, topPercent;
                if (typeof data.centerXPercent === 'number' && typeof data.topPercent === 'number') {
                    centerXPercent = data.centerXPercent;
                    topPercent = data.topPercent;
                } else if (typeof data.leftPercent === 'number' && typeof data.topPercent === 'number') {
                    const panelWidth = panel.offsetWidth || 360;
                    const leftPx = (data.leftPercent / 100) * window.innerWidth;
                    const centerX = leftPx + panelWidth / 2;
                    centerXPercent = (centerX / window.innerWidth) * 100;
                    topPercent = data.topPercent;
                } else {
                    centerXPercent = 80;
                    topPercent = 10;
                }
                applyPosition(centerXPercent, topPercent);
            } else {
                applyPosition(85, 10);
            }
        } catch (e) {
            applyPosition(85, 10);
        }
    }

    function savePanelPositionFromRect() {
        const rect = panel.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const centerX = rect.left + rect.width / 2;
        const centerXPercent = (centerX / viewportWidth) * 100;
        const topPercent = (rect.top / viewportHeight) * 100;
        applyPosition(centerXPercent, topPercent);
    }

    window.addEventListener('resize', () => {
        if (!panel.classList.contains('hidden')) {
            loadPanelPosition();
        }
    });

    // #########################
    // TAB SWITCHING
    // #########################
    function switchTab(tabId) {
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });
        Object.keys(tabContents).forEach(key => {
            tabContents[key].classList.toggle('active', key === tabId);
        });
        if (tabId === 'spin') {
            updateSpinDisplayFromCache();
        }
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });

    // #########################
    // DRAG LOGIC
    // #########################
    let isDragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    const dragHandle = panel.querySelector('.drag-handle');

    dragHandle.addEventListener('mousedown', (e) => {
        if (e.target.closest('.close-btn') || e.target.closest('.header-btn')) return;
        isDragging = true;
        const rect = panel.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        panel.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let x = e.clientX - dragOffsetX;
        let y = e.clientY - dragOffsetY;
        const panelWidth = panel.offsetWidth;
        const panelHeight = panel.offsetHeight;
        const maxX = window.innerWidth - panelWidth;
        const maxY = window.innerHeight - panelHeight;
        x = Math.max(0, Math.min(x, maxX));
        y = Math.max(0, Math.min(y, maxY));

        panel.style.left = x + 'px';
        panel.style.top = y + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            panel.style.cursor = '';
            document.body.style.userSelect = '';
            savePanelPositionFromRect();
        }
    });

    // #########################
    // TOGGLE PANEL
    // #########################
    function togglePanel(show) {
        if (show === undefined) {
            panel.classList.toggle('hidden');
        } else if (show) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
        if (panel.classList.contains('hidden')) {
            toggleBtn.textContent = '🚀';
            toggleBtn.classList.remove('active');
        } else {
            toggleBtn.textContent = '🚀';
            toggleBtn.classList.add('active');
            loadPanelPosition();
        }
    }

    toggleBtn.addEventListener('click', () => togglePanel());
    closeBtn.addEventListener('click', () => togglePanel(false));

    // Start hidden
    togglePanel(false);

    // #########################
    // OPEN CREATE SERVER PAGE
    // #########################
    openPageBtn.addEventListener('click', () => {
        window.location.href = "https://www.mcserverhost.com/create-free-server";
    });

    // #########################
    // TOKEN COPIER
    // #########################
    function updateTokenUI() {
        const token = localStorage.getItem('token');
        if (token && token.length > 10) {
            tokenPreview.textContent = token.substring(0, 24) + '...';
            tokenPreview.title = token;
            tokenPreview.classList.add('loaded');
            copyBtn.disabled = false;
        } else {
            tokenPreview.textContent = '❌ No token';
            tokenPreview.title = '';
            tokenPreview.classList.remove('loaded');
            copyBtn.disabled = true;
        }
    }

    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const token = localStorage.getItem('token');
        if (!token || token.length < 10) {
            log('❌ No valid token to copy!', 'error');
            return;
        }
        GM_setClipboard(token, 'text');
        log('✅ Token copied to clipboard!', 'success');
        console.log('[Token Copier]', token);
        setTimeout(() => {
            if (localStorage.getItem('token')) {
                log('Ready.', 'info');
            } else {
                log('No token found.', 'error');
            }
        }, 2000);
    });

    updateTokenUI();
    setInterval(updateTokenUI, 5000);

    const initialToken = localStorage.getItem('token');
    if (initialToken) {
        console.log('[Token Copier] Token loaded:', initialToken);
    } else {
        console.log('[Token Copier] No token found in localStorage.');
    }

    // #########################
    // SERVER DETAILS (UUID + NODE)
    // #########################
    let nodeMapCache = null;
    let currentServerDetails = null;
    let terminalUuid = null;
    let terminalNodeName = null;

    async function getNodeMap() {
        if (nodeMapCache) return nodeMapCache;
        try {
            const resp = await fetch('https://api.mcserverhost.com/status', {
                headers: { 'Accept': 'application/json' }
            });
            if (!resp.ok) throw new Error(`Status fetch failed: ${resp.status}`);
            const data = await resp.json();
            const nodes = data.nodes || [];
            const map = {};
            nodes.forEach(node => {
                map[node.node_id] = node.node_name;
            });
            nodeMapCache = map;
            return map;
        } catch (err) {
            log(`❌ Failed to fetch node status: ${err.message}`, 'error');
            return {};
        }
    }

    function getServerIdFromURL() {
        const match = window.location.pathname.match(/\/servers\/(\d+)/);
        return match ? parseInt(match[1]) : null;
    }

    async function fetchServerList() {
        const token = getBearerToken();
        if (!token) {
            log('❌ No bearer token to fetch server list.', 'error');
            return null;
        }
        try {
            const listUrl = 'https://api.mcserverhost.com/user/servers?limit=50&offset=0';
            const csrf = generateCsrfToken();
            const resp = await fetch(listUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': csrf
                }
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const servers = await resp.json();
            if (!Array.isArray(servers)) throw new Error('Invalid response');
            return servers;
        } catch (err) {
            log(`❌ Failed to fetch servers: ${err.message}`, 'error');
            return null;
        }
    }

    async function updateServerDetails() {
        const serverId = getServerIdFromURL();
        if (!serverId) {
            uuidPreview.textContent = 'Not on server page';
            uuidPreview.title = '';
            uuidPreview.classList.remove('loaded');
            uuidCopyBtn.disabled = true;
            nodeIdPreview.textContent = 'N/A';
            nodeIdPreview.title = '';
            nodeIdPreview.classList.remove('loaded');
            nodeIdCopyBtn.disabled = true;
            nodeNamePreview.textContent = 'N/A';
            nodeNamePreview.title = '';
            nodeNamePreview.classList.remove('loaded');
            nodeNameCopyBtn.disabled = true;
            currentServerDetails = null;
            terminalUuid = null;
            terminalNodeName = null;
            // Remove page explorer if injected
            removePageExplorer();
            return;
        }

        uuidPreview.textContent = '⏳ Fetching...';
        uuidPreview.classList.remove('loaded');
        uuidCopyBtn.disabled = true;
        nodeIdPreview.textContent = '⏳';
        nodeIdPreview.classList.remove('loaded');
        nodeIdCopyBtn.disabled = true;
        nodeNamePreview.textContent = '⏳';
        nodeNamePreview.classList.remove('loaded');
        nodeNameCopyBtn.disabled = true;

        const servers = await fetchServerList();
        if (!servers) {
            uuidPreview.textContent = '❌ Failed to fetch';
            nodeIdPreview.textContent = '❌';
            nodeNamePreview.textContent = '❌';
            currentServerDetails = null;
            terminalUuid = null;
            terminalNodeName = null;
            removePageExplorer();
            return;
        }

        const server = servers.find(s => s.id === serverId);
        if (!server) {
            uuidPreview.textContent = '❌ Server not found';
            uuidPreview.title = '';
            uuidPreview.classList.remove('loaded');
            uuidCopyBtn.disabled = true;
            nodeIdPreview.textContent = '❌';
            nodeIdPreview.classList.remove('loaded');
            nodeIdCopyBtn.disabled = true;
            nodeNamePreview.textContent = '❌';
            nodeNamePreview.classList.remove('loaded');
            nodeNameCopyBtn.disabled = true;
            currentServerDetails = null;
            terminalUuid = null;
            terminalNodeName = null;
            removePageExplorer();
            return;
        }

        const uuid = server.uuid || '';
        if (uuid) {
            uuidPreview.textContent = uuid;
            uuidPreview.title = uuid;
            uuidPreview.classList.add('loaded');
            uuidCopyBtn.disabled = false;
        } else {
            uuidPreview.textContent = '❌ No UUID';
            uuidPreview.title = '';
            uuidPreview.classList.remove('loaded');
            uuidCopyBtn.disabled = true;
        }

        const nodeId = server.node_id;
        let nodeName = 'Unknown';
        if (nodeId !== undefined && nodeId !== null) {
            nodeIdPreview.textContent = nodeId;
            nodeIdPreview.title = String(nodeId);
            nodeIdPreview.classList.add('loaded');
            nodeIdCopyBtn.disabled = false;

            const nodeMap = await getNodeMap();
            nodeName = nodeMap[nodeId] || 'Unknown';
            nodeName = nodeName.replace('.mcserverhost.com', '');
            if (nodeName) {
                nodeNamePreview.textContent = nodeName;
                nodeNamePreview.title = nodeName;
                nodeNamePreview.classList.add('loaded');
                nodeNameCopyBtn.disabled = false;
            } else {
                nodeNamePreview.textContent = 'Unknown';
                nodeNamePreview.title = '';
                nodeNamePreview.classList.remove('loaded');
                nodeNameCopyBtn.disabled = true;
            }
        } else {
            nodeIdPreview.textContent = 'N/A';
            nodeIdPreview.classList.remove('loaded');
            nodeIdCopyBtn.disabled = true;
            nodeNamePreview.textContent = 'N/A';
            nodeNamePreview.classList.remove('loaded');
            nodeNameCopyBtn.disabled = true;
        }

        currentServerDetails = {
            id: serverId,
            uuid: uuid,
            nodeId: nodeId,
            nodeName: nodeName
        };
        terminalUuid = uuid;
        terminalNodeName = nodeName;

        // Inject terminal if on console tab
        if (uuid && nodeName && nodeName !== 'Unknown' && window.location.href.includes('?tab=console')) {
            injectTerminal(uuid, nodeName);
            hideQuickActions();
        }

        if (uuid) {
            injectPowerButtons(uuid);
            // Inject page explorer if ?tab=files is present, else remove it
            if (window.location.href.includes('?tab=files')) {
                if (!document.getElementById('mcs-page-explorer')) {
                    injectPageExplorer(uuid);
                }
            } else {
                if (document.getElementById('mcs-page-explorer')) {
                    removePageExplorer();
                }
            }
        }

        fetchSpinStatus();
    }

    // Copy handlers
    uuidCopyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uuid = uuidPreview.textContent;
        if (!uuid || uuid.includes('Not') || uuid.includes('Failed') || uuid.includes('⏳') || uuid.includes('❌')) {
            log('❌ No valid UUID to copy.', 'error');
            return;
        }
        GM_setClipboard(uuid, 'text');
        log('✅ UUID copied to clipboard!', 'success');
    });

    nodeIdCopyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeId = nodeIdPreview.textContent;
        if (!nodeId || nodeId === 'N/A' || nodeId === '⏳' || nodeId === '❌') {
            log('❌ No valid Node ID to copy.', 'error');
            return;
        }
        GM_setClipboard(nodeId, 'text');
        log('✅ Node ID copied to clipboard!', 'success');
    });

    nodeNameCopyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nodeName = nodeNamePreview.textContent;
        if (!nodeName || nodeName === 'N/A' || nodeName === '⏳' || nodeName === '❌' || nodeName === 'Unknown') {
            log('❌ No valid Node Name to copy.', 'error');
            return;
        }
        GM_setClipboard(nodeName, 'text');
        log('✅ Node Name copied to clipboard!', 'success');
    });

    fetchUuidBtn.addEventListener('click', updateServerDetails);

    setTimeout(updateServerDetails, 500);

    let lastUrl = location.href;
    setInterval(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            updateServerDetails();
        }
    }, 2000);

    // #########################
    // HIDE QUICK ACTIONS
    // #########################
    function hideQuickActions() {
        try {
            const sel = '#root > div > div > div > div > main > div:nth-child(2) > div > :nth-child(3)';
            const el = document.querySelector(sel);
            if (el) {
                el.style.display = 'none';
            }
        } catch (e) {}
    }

    // #########################
    // POWER BUTTONS
    // #########################
    function getPowerContainer() {
        const sel = '#root > div > div.flex-grow > div > aside > div > :nth-child(3)';
        return document.querySelector(sel);
    }

    function injectPowerButtons(uuid) {
        const originalContainer = getPowerContainer();
        if (!originalContainer) {
            setTimeout(() => injectPowerButtons(uuid), 500);
            return;
        }
        originalContainer.style.display = "none";

        const existingWrapper = document.getElementById('mcs-custom-power-wrapper');
        if (existingWrapper) return;

        const wrapper = document.createElement('div');
        wrapper.id = 'mcs-custom-power-wrapper';
        wrapper.className = 'mcs-custom-power-wrapper';

        const grid = document.createElement('div');
        grid.className = 'mcs-power-grid';

        const actions = [
            { label: 'Start', action: 'start', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5,3 19,12 5,21 5,3"/></svg>`, color: '#22c55e' },
            { label: 'Restart', action: 'restart', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`, color: '#3b82f6' },
            { label: 'Stop', action: 'stop', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`, color: '#b91c1c' },
            { label: 'Kill', action: 'kill', svg: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`, color: '#ef4444' }
        ];

        actions.forEach(({ label, action, svg, color }) => {
            const btn = document.createElement('button');
            btn.innerHTML = svg + label;
            if (color) {
                btn.style.color = color;
                btn.style.borderColor = color + '44';
            }
            btn.addEventListener('click', () => {
                callPowerAction(uuid, action);
            });
            grid.appendChild(btn);
        });

        wrapper.appendChild(grid);

        const statusDiv = document.createElement('div');
        statusDiv.className = 'mcs-power-status';
        statusDiv.id = 'mcs-power-status';
        statusDiv.textContent = '';
        wrapper.appendChild(statusDiv);

        originalContainer.parentNode.insertBefore(wrapper, originalContainer.nextSibling);
    }

    async function callPowerAction(uuid, action) {
        const statusDiv = document.getElementById('mcs-power-status');
        if (!statusDiv) return;

        const token = getBearerToken();
        if (!token) {
            statusDiv.textContent = '❌ No token available.';
            statusDiv.className = 'mcs-power-status error';
            return;
        }

        const url = `https://api.mcserverhost.com/user/servers/${uuid}/power`;
        const payload = { action: action, wait_seconds: 0 };

        statusDiv.textContent = `⏳ Sending ${action}...`;
        statusDiv.className = 'mcs-power-status info';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            let responseBody = '';
            let isError = !response.ok;
            try {
                const json = await response.json();
                responseBody = JSON.stringify(json.message);
            } catch (e) {
                responseBody = await response.text();
            }

            if (isError) {
                statusDiv.textContent = `❌ ${action.toUpperCase()} FAILED: ${responseBody}`;
                statusDiv.className = 'mcs-power-status error';
            } else {
                statusDiv.textContent = `✅ ${action.toUpperCase()} SUCCESS`;
                statusDiv.className = 'mcs-power-status success';
            }
        } catch (error) {
            statusDiv.textContent = `❌ Network error: ${error.message}`;
            statusDiv.className = 'mcs-power-status error';
        }
    }

    // #########################
    // SPIN WHEEL
    // #########################
    let spinData = null;
    let spinCountdownInterval = null;

    function getCsrfToken() {
        return sessionStorage.getItem('csrf_token') || '';
    }

    async function fetchSpinStatus() {
        const token = getBearerToken();
        if (!token) {
            spinCan.textContent = '❌ No token available';
            spinBtn.disabled = true;
            spinData = null;
            stopSpinCountdown();
            return;
        }

        try {
            const resp = await fetch('https://api.mcserverhost.com/spin-wheel/status', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCsrfToken()
                }
            });

            if (!resp.ok) {
                throw new Error(`HTTP ${resp.status}`);
            }

            const data = await resp.json();
            spinData = data;
            applySpinData(data);
            startSpinCountdown(data.time_remaining_seconds);
        } catch (error) {
            console.error('Spin status error:', error);
            spinCan.textContent = '❌ Failed to load';
            spinBtn.disabled = true;
            spinData = null;
            stopSpinCountdown();
        }
    }

    function applySpinData(data) {
        spinTotal.textContent = data.total_spins ?? '--';
        spinCredits.textContent = data.total_won_credits ?? '--';
        spinUsd.textContent = data.total_won_usd ? `$${data.total_won_usd.toFixed(2)}` : '--';

        const canSpin = data.can_spin === true;
        if (canSpin) {
            spinCan.innerHTML = '<span class="can-spin">✅ Ready to spin!</span>';
            spinBtn.disabled = false;
            spinBtn.textContent = '🎰 SPIN!';
        } else {
            spinCan.innerHTML = `<span class="cannot-spin">⏳ Cooldown</span>`;
            spinBtn.disabled = true;
            spinBtn.textContent = '⏳ Wait...';
        }

        const remaining = data.time_remaining_seconds || 0;
        spinCountdown.textContent = formatTime(remaining);
    }

    function startSpinCountdown(initialSeconds) {
        stopSpinCountdown();
        if (initialSeconds <= 0) {
            spinCountdown.textContent = '00:00:00';
            if (spinData && spinData.can_spin === false) {
                setTimeout(fetchSpinStatus, 500);
            }
            return;
        }

        let remaining = initialSeconds;
        spinCountdown.textContent = formatTime(remaining);

        spinCountdownInterval = setInterval(() => {
            remaining--;
            if (remaining <= 0) {
                remaining = 0;
                spinCountdown.textContent = formatTime(0);
                stopSpinCountdown();
                fetchSpinStatus();
            } else {
                spinCountdown.textContent = formatTime(remaining);
            }
        }, 1000);
    }

    function stopSpinCountdown() {
        if (spinCountdownInterval) {
            clearInterval(spinCountdownInterval);
            spinCountdownInterval = null;
        }
    }

    function formatTime(seconds) {
        seconds = Math.max(0, Math.floor(seconds));
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${secs}`;
    }

    function updateSpinDisplayFromCache() {
        if (spinData) {
            applySpinData(spinData);
            if (!spinCountdownInterval && spinData.time_remaining_seconds > 0) {
                startSpinCountdown(spinData.time_remaining_seconds);
            }
        } else {
            spinCan.textContent = 'Loading...';
            spinBtn.disabled = true;
            fetchSpinStatus();
        }
    }

    async function performSpin() {
        const token = getBearerToken();
        if (!token) {
            spinResult.textContent = '❌ No token available';
            spinResult.className = 'mcs-spin-result error';
            return;
        }

        spinBtn.disabled = true;
        spinBtn.textContent = '⏳ Spinning...';
        spinResult.textContent = '🎰 Spinning the wheel...';
        spinResult.className = 'mcs-spin-result';

        try {
            const resp = await fetch('https://api.mcserverhost.com/spin-wheel/spin', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': getCsrfToken()
                },
                body: JSON.stringify({})
            });

            const data = await resp.json();

            if (data.success) {
                const reward = data.reward_credits || 0;
                const tier = data.reward_tier || 'unknown';
                const usd = data.reward_value_usd || 0;
                spinResult.innerHTML = `
                    🎉 <span class="reward-tier">${tier.toUpperCase()}</span> tier!
                    Earned <span class="reward-credits">${reward} credits</span>
                    ($${usd.toFixed(2)})
                    <br><small>Spin #${data.spin_number || '?'}</small>
                `;
                spinResult.className = 'mcs-spin-result success';
                await fetchSpinStatus();
            } else if (data.error === 'cooldown') {
                const remaining = data.time_remaining_seconds || 0;
                spinResult.innerHTML = `⏳ Cooldown active. Remaining: <strong>${formatTime(remaining)}</strong>`;
                spinResult.className = 'mcs-spin-result error';
                if (spinData) {
                    spinData.time_remaining_seconds = remaining;
                    spinData.can_spin = false;
                    applySpinData(spinData);
                    startSpinCountdown(remaining);
                } else {
                    await fetchSpinStatus();
                }
            } else {
                spinResult.textContent = `❌ ${data.error || 'Unknown error'}`;
                spinResult.className = 'mcs-spin-result error';
                await fetchSpinStatus();
            }
        } catch (error) {
            console.error('Spin error:', error);
            spinResult.textContent = `❌ Network error: ${error.message}`;
            spinResult.className = 'mcs-spin-result error';
            spinBtn.disabled = false;
            spinBtn.textContent = '🎰 SPIN!';
        }
    }

    spinBtn.addEventListener('click', performSpin);
    spinRefreshBtn.addEventListener('click', fetchSpinStatus);

    setTimeout(() => {
        if (tabContents.spin.classList.contains('active')) {
            fetchSpinStatus();
        } else {
            fetchSpinStatus();
        }
    }, 1000);

    // #########################
    // BACKUP HANDLER
    // #########################
    backupBtn.addEventListener('click', async function(e) {
        e.preventDefault();

        const token = getBearerToken();
        if (!token) {
            log('❌ No bearer token. Please log in first.', 'error');
            return;
        }

        const match = window.location.pathname.match(/\/servers\/(\d+)/);
        if (!match) {
            log('❌ Not on a server page (URL must contain /servers/<ID>).', 'error');
            return;
        }
        const serverId = parseInt(match[1]);
        if (isNaN(serverId)) {
            log('❌ Invalid server ID in URL.', 'error');
            return;
        }

        const filesRaw = backupFilesInput.value.trim();
        if (!filesRaw) {
            log('❌ Please specify at least one file/directory.', 'error');
            return;
        }
        const files = filesRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);
        if (files.length === 0) {
            log('❌ No valid files specified.', 'error');
            return;
        }

        const servers = await fetchServerList();
        if (!servers) {
            log('❌ Could not fetch server list.', 'error');
            return;
        }
        const server = servers.find(s => s.id === serverId);
        if (!server) {
            log(`❌ Server ID ${serverId} not found.`, 'error');
            return;
        }
        const uuid = server.uuid;
        if (!uuid) {
            log('❌ Server has no UUID.', 'error');
            return;
        }

        const backupUrl = `https://api.mcserverhost.com/user/servers/${uuid}/files/compress`;
        const body = {
            root: "/",
            files: files
        };

        log(`⏳ Creating backup for files: ${files.join(', ')}...`);

        try {
            const backupResp = await fetch(backupUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': generateCsrfToken()
                },
                body: JSON.stringify(body)
            });

            if (!backupResp.ok) {
                const errData = await backupResp.json().catch(() => ({}));
                throw new Error(errData.message || errData.error || `HTTP ${backupResp.status}`);
            }

            const result = await backupResp.json();
            log(`✅ Backup initiated successfully! Response: ${JSON.stringify(result)}`, 'success');
            console.log('Backup response:', result);

        } catch (error) {
            log(`❌ Backup error: ${error.message}`, 'error');
            console.error('Backup error:', error);
        }
    });

    // #########################
    // TERMINAL
    // #########################
    function getConsoleTarget() {
        const sel = '#root > div > div.flex-grow > div > div > main > div:nth-child(2) > div > div:nth-of-type(2)';
        return document.querySelector(sel);
    }

    async function fetchWebSocketToken() {
        const bearer = getBearerToken();
        if (!bearer) {
            console.warn('No bearer token available to fetch WebSocket token');
            return null;
        }
        if (!terminalUuid) {
            console.warn('No UUID available to fetch WebSocket token');
            return null;
        }
        try {
            const url = `https://api.mcserverhost.com/user/servers/${terminalUuid}/ws`;
            const resp = await fetch(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${bearer}`
                }
            });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            if (data.token && data.token.length > 10) {
                return data.token;
            } else {
                throw new Error('Invalid token in response');
            }
        } catch (err) {
            console.error('Failed to fetch WebSocket token:', err);
            return null;
        }
    }

    function getTerminalConstructor() {
        if (typeof window.Terminal === 'function') return window.Terminal;
        if (typeof Terminal === 'function') return Terminal;
        return null;
    }

    function getFitAddonConstructor() {
        if (typeof window.FitAddon === 'function') return window.FitAddon;
        if (window.FitAddon && typeof window.FitAddon.FitAddon === 'function') return window.FitAddon.FitAddon;
        if (typeof FitAddon === 'function') return FitAddon;
        if (FitAddon && typeof FitAddon.FitAddon === 'function') return FitAddon.FitAddon;
        return null;
    }

    function loadScriptViaGM(url) {
        return new Promise((resolve, reject) => {
            const cacheBuster = Date.now();
            GM_xmlhttpRequest({
                method: 'GET',
                url: url + '?ts=' + cacheBuster,
                nocache: true,
                onload: function(response) {
                    if (response.status === 200) {
                        try {
                            eval(response.responseText);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    } else {
                        reject(new Error('HTTP ' + response.status));
                    }
                },
                onerror: function(error) {
                    reject(error);
                }
            });
        });
    }

    async function loadTerminalLibraries() {
        const retries = 5;
        let lastError = null;
        for (let i = 0; i < retries; i++) {
            try {
                await loadScriptViaGM('https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/lib/xterm.min.js');
                await loadScriptViaGM('https://cdn.jsdelivr.net/npm/@xterm/addon-fit@0.10.0/lib/addon-fit.min.js');
                const TerminalClass = getTerminalConstructor();
                const FitAddonClass = getFitAddonConstructor();
                if (!TerminalClass || !FitAddonClass) {
                    throw new Error('Constructors not found after loading');
                }
                return;
            } catch (err) {
                lastError = err;
                console.warn(`Library load attempt ${i+1} failed:`, err);
                await new Promise(r => setTimeout(r, 1000 * (i+1)));
            }
        }
        throw new Error(`Failed to load terminal libraries after ${retries} attempts: ${lastError?.message || 'unknown error'}`);
    }

    let terminalRetryCount = 0;
    let terminalRetryTimer = null;

    async function injectTerminal(uuid, nodeName) {
        if (!window.location.href.includes('?tab=console')) {
            console.log('[Terminal] Not on console tab, skipping injection.');
            return;
        }

        const target = getConsoleTarget();
        if (!target) {
            console.log('[Terminal] Console target not found, retrying...');
            setTimeout(() => injectTerminal(uuid, nodeName), 1000);
            return;
        }

        if (target.querySelector('.mcs-terminal-wrapper')) {
            console.log('[Terminal] Already injected.');
            return;
        }

        const placeholder = document.createElement('div');
        placeholder.className = 'mcs-terminal-placeholder';
        placeholder.id = 'mcs-terminal-placeholder';
        placeholder.innerHTML = `<span style="font-size:14px; color:#888;">⏳ Loading terminal...</span>`;
        target.innerHTML = '';
        target.appendChild(placeholder);

        try {
            await loadTerminalLibraries();
        } catch (err) {
            console.error('[Terminal] Library load error:', err);
            terminalRetryCount++;
            if (terminalRetryCount >= 5) {
                placeholder.innerHTML = `
                    <span style="color:#ef9a9a;">❌ Failed to load terminal libraries.</span>
                    <button id="mcs-terminal-retry-btn">🔄 Reload Terminal</button>
                `;
                document.getElementById('mcs-terminal-retry-btn')?.addEventListener('click', () => {
                    terminalRetryCount = 0;
                    target.innerHTML = '';
                    injectTerminal(uuid, nodeName);
                });
                return;
            }
            const delay = Math.min(1000 * Math.pow(2, terminalRetryCount), 10000);
            console.warn(`[Terminal] Retrying in ${delay}ms... (attempt ${terminalRetryCount})`);
            if (terminalRetryTimer) clearTimeout(terminalRetryTimer);
            terminalRetryTimer = setTimeout(() => {
                terminalRetryTimer = null;
                injectTerminal(uuid, nodeName);
            }, delay);
            return;
        }

        terminalRetryCount = 0;
        if (terminalRetryTimer) {
            clearTimeout(terminalRetryTimer);
            terminalRetryTimer = null;
        }

        const placeholderEl = document.getElementById('mcs-terminal-placeholder');
        if (placeholderEl) placeholderEl.remove();

        const TerminalClass = getTerminalConstructor();
        const FitAddonClass = getFitAddonConstructor();

        if (!TerminalClass || !FitAddonClass) {
            log('❌ Terminal constructors missing after loading.', 'error');
            return;
        }

        if (!document.querySelector('link[href*="xterm.min.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/@xterm/xterm@5.5.0/css/xterm.min.css';
            document.head.appendChild(link);
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'mcs-terminal-wrapper';

        const statusBar = document.createElement('div');
        statusBar.className = 'mcs-terminal-status';
        statusBar.innerHTML = `
            <span class="status-text">
                <span class="dot disconnected" id="mcs-term-dot"></span>
                <span id="mcs-term-status">Disconnected</span>
            </span>
            <span>
                <button class="mcs-copy-logs-btn" id="mcs-copy-logs-btn" title="Copy latest log to clipboard">📋 Logs</button>
                <span class="mcs-term-info" id="mcs-term-info">${nodeName} · ${uuid.substring(0,8)}</span>
            </span>
        `;
        wrapper.appendChild(statusBar);

        const outputDiv = document.createElement('div');
        outputDiv.className = 'mcs-terminal-output';
        outputDiv.id = 'mcs-term-output';
        wrapper.appendChild(outputDiv);

        const inputRow = document.createElement('div');
        inputRow.className = 'mcs-terminal-input-row';
        inputRow.innerHTML = `
            <input type="text" id="mcs-term-input" placeholder="Type a command..." disabled spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off" data-lpignore="true" />
            <button id="mcs-term-send" disabled>Send</button>
        `;
        wrapper.appendChild(inputRow);

        target.innerHTML = '';
        target.appendChild(wrapper);

        const term = new TerminalClass({
            cursorBlink: false,
            fontSize: 14,
            fontFamily: "'Courier New', monospace",
            theme: {
                background: '#0d0d0d',
                foreground: '#d4d4d4',
            },
            scrollback: 10000,
            disableStdin: true,
            scrollOnUserInput: false,
        });

        const fitAddon = new FitAddonClass();
        term.loadAddon(fitAddon);
        term.open(outputDiv);

        function fitTerminal() {
            try { fitAddon.fit(); } catch (e) {}
        }
        fitTerminal();
        setTimeout(fitTerminal, 200);
        setTimeout(fitTerminal, 800);

        const resizeObserver = new ResizeObserver(() => fitTerminal());
        resizeObserver.observe(outputDiv);

        const termInput = document.getElementById('mcs-term-input');
        const termSend = document.getElementById('mcs-term-send');
        const termDot = document.getElementById('mcs-term-dot');
        const termStatus = document.getElementById('mcs-term-status');
        const copyLogsBtn = document.getElementById('mcs-copy-logs-btn');

        copyLogsBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const token = getBearerToken();
            if (!token) {
                log('❌ No token available to fetch logs.', 'error');
                return;
            }
            if (!uuid) {
                log('❌ No UUID available.', 'error');
                return;
            }
            const url = `https://api.mcserverhost.com/user/servers/${uuid}/files/contents?file=%2Flogs%2Flatest.log`;
            copyLogsBtn.textContent = '⏳ Fetching...';
            copyLogsBtn.disabled = true;
            try {
                const resp = await fetch(url, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!resp.ok) {
                    let errMsg = `HTTP ${resp.status}`;
                    try {
                        const json = await resp.json();
                        errMsg = json.message || json.error || errMsg;
                    } catch (_) {}
                    throw new Error(errMsg);
                }
                const logText = await resp.text();
                GM_setClipboard(logText, 'text');
                log(`✅ Log copied to clipboard (${logText.length} characters).`, 'success');
                copyLogsBtn.textContent = '✅ Copied!';
                setTimeout(() => {
                    copyLogsBtn.textContent = '📋 Logs';
                    copyLogsBtn.disabled = false;
                }, 3000);
            } catch (error) {
                log(`❌ Failed to fetch log: ${error.message}`, 'error');
                copyLogsBtn.textContent = '❌ Error';
                setTimeout(() => {
                    copyLogsBtn.textContent = '📋 Logs';
                    copyLogsBtn.disabled = false;
                }, 3000);
            }
        });

        // ---- Output cache ----
        const STORAGE_KEY = `mcs_terminal_log_${uuid}`;
        const MAX_LINES = 2000;

        function loadCachedLines() {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                if (data) {
                    const lines = JSON.parse(data);
                    if (Array.isArray(lines) && lines.length > 0) {
                        for (const line of lines) {
                            term.write(line + '\r\n');
                        }
                        return lines.length;
                    }
                }
            } catch (e) {
                console.warn('Failed to load terminal cache:', e);
            }
            return 0;
        }

        function appendToCache(line) {
            try {
                let lines = [];
                const data = localStorage.getItem(STORAGE_KEY);
                if (data) {
                    lines = JSON.parse(data);
                    if (!Array.isArray(lines)) lines = [];
                }
                lines.push(line);
                if (lines.length > MAX_LINES) {
                    lines = lines.slice(-MAX_LINES);
                }
                localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
            } catch (e) {
                console.warn('Failed to save terminal cache, clearing...', e);
                localStorage.removeItem(STORAGE_KEY);
            }
        }

        // ---- Command history cache ----
        const CMD_HISTORY_KEY = `mcs_terminal_cmd_history_${uuid}`;
        const MAX_HISTORY = 200;

        function loadCommandHistory() {
            try {
                const data = localStorage.getItem(CMD_HISTORY_KEY);
                if (data) {
                    const arr = JSON.parse(data);
                    if (Array.isArray(arr) && arr.length > 0) {
                        commandHistory = arr;
                        historyIndex = commandHistory.length;
                    }
                }
            } catch (e) {
                console.warn('Failed to load command history:', e);
            }
        }

        function saveCommandHistory() {
            try {
                if (commandHistory.length > MAX_HISTORY) {
                    commandHistory = commandHistory.slice(-MAX_HISTORY);
                }
                localStorage.setItem(CMD_HISTORY_KEY, JSON.stringify(commandHistory));
            } catch (e) {
                console.warn('Failed to save command history:', e);
            }
        }

        // ---- WebSocket state with reconnect ----
        let ws = null;
        let isAuthenticated = false;
        let commandHistory = [];
        let historyIndex = 0;
        let reconnectAttempts = 0;
        const MAX_RECONNECT_ATTEMPTS = 10;
        let reconnectTimer = null;
        let manualClose = false;

        let currentToken = null;
        let currentUuid = uuid;
        let currentNodeName = nodeName;

        loadCommandHistory();

        function setStatus(text, connected) {
            termStatus.textContent = text;
            console.log(text);
            termDot.className = 'dot ' + (connected ? 'connected' : 'disconnected');
        }

        function setInputEnabled(enabled) {
            termInput.disabled = !enabled;
            termSend.disabled = !enabled;
            if (enabled) termInput.focus();
        }

        function termWrite(text) {
            term.write(text);
        }

        function termPrintLine(text) {
            termWrite(text + '\r\n');
        }

        function connectWebSocket(token) {
            if (!token || token.trim().length < 10) {
                fetchWebSocketToken().then(wsToken => {
                    if (wsToken) {
                        connectWebSocket(wsToken);
                    } else {
                        setStatus('❌ No valid token', false);
                        scheduleReconnect();
                    }
                }).catch(() => {
                    setStatus('❌ Token fetch failed', false);
                    scheduleReconnect();
                });
                return;
            }

            if (ws && ws.readyState !== WebSocket.CLOSED) {
                return;
            }

            manualClose = false;
            currentToken = token;
            setStatus('Connecting...', false);
            setInputEnabled(false);
            isAuthenticated = false;

            const wsUrl = `wss://${currentNodeName}.mcserverhost.com:8080/api/servers/${currentUuid}/ws`;
            ws = new WebSocket(wsUrl);

            ws.onopen = function() {
                setStatus('Authenticating...', false);
                ws.send(JSON.stringify({ event: "auth", args: [token.trim()] }));
            };

            ws.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);

                    if (data.event === 'auth success') {
                        setStatus('✅ Live', true);
                        isAuthenticated = true;
                        setInputEnabled(true);
                        reconnectAttempts = 0;
                        termPrintLine('\x1b[32m✓ Connected to server console.\x1b[0m');
                        termPrintLine('\x1b[90mType commands in the input box below.\x1b[0m');
                        termPrintLine('');
                        const statsInterval = setInterval(() => {
                            if (ws && ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ event: "send stats", args: [] }));
                            }
                        }, 1000);
                        return;
                    }

                    if (data.event === 'auth error') {
                        setStatus('❌ Auth Failed', false);
                        setInputEnabled(false);
                        termPrintLine('\x1b[31m✗ Authentication failed. Check your token.\x1b[0m');
                        scheduleReconnect();
                        return;
                    }

                    if (data.event === 'console output') {
                        const logLine = data.args ? data.args[0] : JSON.stringify(data);
                        termWrite(logLine + '\r\n');
                        appendToCache(logLine);
                        return;
                    }

                    if (data.event === 'status') {
                        const val = data.args ? data.args[0] : '';
                        if (val === 'running') setStatus('✅ Server Running', true);
                        else if (val === 'offline') setStatus('⏹ Server Offline', false);
                        else setStatus(`📡 ${val}`, false);
                        termWrite(`\x1b[90m[STATUS] ${JSON.stringify(data.args)}\x1b[0m\r\n`);
                        return;
                    }
                } catch (e) {
                    termWrite(`\x1b[90m[RAW] ${event.data}\x1b[0m\r\n`);
                }
            };

            ws.onerror = function(event) {
                const errorMsg = event.message || event.type || 'Unknown error';
                console.error('[Terminal] WebSocket error:', event, 'URL:', wsUrl);
            };

            ws.onclose = function(event) {
                if (manualClose) {
                    setStatus('⏹ Disconnected', false);
                    return;
                }
                if (isAuthenticated) {
                    setStatus('⚠️ Disconnected', false);
                    termPrintLine('\x1b[31m✗ Disconnected.\x1b[0m');
                } else {
                    setStatus('⏹ Disconnected', false);
                }
                isAuthenticated = false;
                setInputEnabled(false);
                scheduleReconnect();
            };
        }

        function scheduleReconnect() {
            if (manualClose) return;
            if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
                setStatus('❌ Max reconnect attempts reached', false);
                termPrintLine('\x1b[31m✗ Failed to reconnect after multiple attempts.\x1b[0m');
                return;
            }
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            reconnectAttempts++;
            setStatus(`⏳ Reconnecting in ${Math.round(delay/1000)}s...`, false);
            reconnectTimer = setTimeout(() => {
                reconnectTimer = null;
                fetchWebSocketToken().then(wsToken => {
                    if (wsToken) {
                        connectWebSocket(wsToken);
                    } else {
                        setStatus('❌ No token, retrying later...', false);
                        scheduleReconnect();
                    }
                }).catch(() => {
                    setStatus('❌ Token fetch failed, retrying...', false);
                    scheduleReconnect();
                });
            }, delay);
        }

        function disconnect() {
            manualClose = true;
            if (ws) {
                ws.close();
                ws = null;
            }
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
            setStatus('⏹ Disconnected', false);
            setInputEnabled(false);
            termPrintLine('\x1b[90m[Disconnected manually]\x1b[0m');
        }

        function handlePageRestore() {
            if (!isAuthenticated && !manualClose) {
                console.log('[Terminal] Page restored, reconnecting...');
                if (reconnectTimer) {
                    clearTimeout(reconnectTimer);
                    reconnectTimer = null;
                }
                reconnectAttempts = 0;
                fetchWebSocketToken().then(wsToken => {
                    if (wsToken) connectWebSocket(wsToken);
                });
            }
        }

        window.addEventListener('pageshow', (event) => {
            if (event.persisted) {
                handlePageRestore();
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (!isAuthenticated && !manualClose) {
                    console.log('[Terminal] Page became visible, reconnecting...');
                    if (reconnectTimer) {
                        clearTimeout(reconnectTimer);
                        reconnectTimer = null;
                    }
                    reconnectAttempts = 0;
                    fetchWebSocketToken().then(wsToken => {
                        if (wsToken) connectWebSocket(wsToken);
                    });
                }
            }
        });

        function sendCommand() {
            if (!isAuthenticated || !ws || ws.readyState !== WebSocket.OPEN) {
                termPrintLine('\x1b[31m✗ Not connected.\x1b[0m');
                return;
            }

            const cmd = termInput.value.trim();
            if (!cmd) return;

            termWrite(`\x1b[1m> ${cmd}\x1b[0m\r\n`);
            ws.send(JSON.stringify({ event: "send command", args: [cmd] }));

            if (commandHistory[commandHistory.length - 1] !== cmd) {
                commandHistory.push(cmd);
                if (commandHistory.length > MAX_HISTORY) {
                    commandHistory = commandHistory.slice(-MAX_HISTORY);
                }
                historyIndex = commandHistory.length;
                saveCommandHistory();
            } else {
                historyIndex = commandHistory.length;
            }

            termInput.value = '';
            termInput.focus();
        }

        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendCommand();
            } else if (e.key === 'ArrowUp') {
                if (commandHistory.length === 0) return;
                e.preventDefault();
                historyIndex = Math.max(0, historyIndex - 1);
                termInput.value = commandHistory[historyIndex];
                requestAnimationFrame(() => termInput.setSelectionRange(termInput.value.length, termInput.value.length));
            } else if (e.key === 'ArrowDown') {
                if (commandHistory.length === 0) return;
                e.preventDefault();
                historyIndex = Math.min(commandHistory.length, historyIndex + 1);
                termInput.value = historyIndex < commandHistory.length ? commandHistory[historyIndex] : '';
                requestAnimationFrame(() => termInput.setSelectionRange(termInput.value.length, termInput.value.length));
            }
        });

        termSend.addEventListener('click', sendCommand);

        const cachedCount = loadCachedLines();
        if (cachedCount > 0) {
            termWrite(`\x1b[90m--- Restored ${cachedCount} cached lines ---\x1b[0m\r\n`);
        }

        fetchWebSocketToken().then(wsToken => {
            if (wsToken) {
                connectWebSocket(wsToken);
            } else {
                setStatus('⏳ Waiting for token...', false);
                const tokenCheck = setInterval(() => {
                    fetchWebSocketToken().then(t => {
                        if (t && !isAuthenticated) {
                            clearInterval(tokenCheck);
                            connectWebSocket(t);
                        }
                    });
                }, 5000);
            }
        }).catch(() => setStatus('❌ Token fetch failed', false));

        log('✅ Terminal injected and auto-connected.', 'success');
    }

    // #########################
    // PAGE FILE EXPLORER (injected into the page)
    // #########################
    let pageExplorerInjected = false;
    let pageExplorerInstance = null;
    // Session cache: maps path -> { entries, timestamp }
    const explorerCache = new Map();

    // Helper to format file sizes
    function formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    // Helper to format dates
    function formatDate(dateStr) {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return d.toLocaleString();
        } catch {
            return dateStr;
        }
    }

    // Context menu
    let contextMenuVisible = false;
    let contextMenuTarget = null;
    let contextMenuEl = null;

    function showContextMenu(e, itemData) {
        hideContextMenu();
        contextMenuTarget = itemData;

        if (!contextMenuEl) {
            contextMenuEl = document.createElement('div');
            contextMenuEl.id = 'mcs-context-menu';
            contextMenuEl.style.cssText = `
                position: fixed;
                background: #1a1a1a;
                border: 1px solid #444;
                border-radius: 6px;
                padding: 4px 0;
                min-width: 160px;
                z-index: 100001;
                box-shadow: 0 8px 24px rgba(0,0,0,0.8);
                display: none;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 13px;
            `;
            document.body.appendChild(contextMenuEl);
            document.addEventListener('click', hideContextMenu);
        }

        const items = [
            { label: 'Rename', action: 'rename' },
            { label: 'Download', action: 'download' },
            { label: 'Archive', action: 'archive' },
            { label: '──────────', action: 'separator' },
            { label: 'Delete', action: 'delete', red: true }
        ];

        contextMenuEl.innerHTML = '';
        items.forEach(item => {
            if (item.action === 'separator') {
                const sep = document.createElement('hr');
                sep.style.cssText = 'border: none; border-top: 1px solid #333; margin: 4px 8px;';
                contextMenuEl.appendChild(sep);
                return;
            }
            const btn = document.createElement('button');
            btn.textContent = item.label;
            btn.style.cssText = `
                display: block;
                width: 100%;
                text-align: left;
                background: transparent;
                border: none;
                color: ${item.red ? '#ef9a9a' : '#ddd'};
                padding: 6px 16px;
                cursor: pointer;
                font-family: inherit;
                font-size: 13px;
                transition: background 0.15s;
            `;
            btn.onmouseover = () => btn.style.background = '#2a2a2a';
            btn.onmouseout = () => btn.style.background = 'transparent';
            btn.onclick = (ev) => {
                ev.stopPropagation();
                hideContextMenu();
                handleContextAction(item.action, contextMenuTarget);
            };
            contextMenuEl.appendChild(btn);
        });

        let x = e.clientX;
        let y = e.clientY;
        if (x + 160 > window.innerWidth) x = window.innerWidth - 160 - 10;
        if (y + 200 > window.innerHeight) y = window.innerHeight - 200 - 10;
        contextMenuEl.style.left = x + 'px';
        contextMenuEl.style.top = y + 'px';
        contextMenuEl.style.display = 'block';
        contextMenuVisible = true;
    }

    function hideContextMenu() {
        if (contextMenuEl) contextMenuEl.style.display = 'none';
        contextMenuVisible = false;
        contextMenuTarget = null;
    }

    // Remove page explorer
    function removePageExplorer() {
        const existing = document.getElementById('mcs-page-explorer');
        if (existing) {
            existing.remove();
            pageExplorerInjected = false;
            pageExplorerInstance = null;
        }
        if (contextMenuEl) {
            contextMenuEl.remove();
            contextMenuEl = null;
        }
        // Clear cache on removal (optional)
        explorerCache.clear();
    }

    // Inject explorer into the page
    function injectPageExplorer(uuid) {
        // Only inject if ?tab=files is present
        if (!window.location.href.includes('?tab=files')) {
            // If explorer exists but we're not on files tab, remove it
            if (document.getElementById('mcs-page-explorer')) {
                removePageExplorer();
            }
            return;
        }

        // If already injected, just return (keep it)
        if (document.getElementById('mcs-page-explorer')) {
            return;
        }

        const targetEl = document.querySelector('#root > div > div.flex-grow > div > div > main > div:nth-child(3) > div > :nth-child(2)');
        const thirdEl = document.querySelector('#root > div > div.flex-grow > div > div > main > div:nth-child(3) > div > :nth-child(3)');
        const managerButton = document.querySelector("#root > div > div.flex-grow > div > div > main > div:nth-child(3) > div > div > :nth-child(1)");

        /* if (!targetEl || !thirdEl) {
            console.log('[PageExplorer] Target elements not found, skipping injection.');
            return;
        } */
        
        try{
            targetEl.style.display = 'none';
            thirdEl.style.display = 'none';
            managerButton.style.display = 'none';
        } catch (e){
            // empty
        }

        const container = document.createElement('div');
        container.id = 'mcs-page-explorer';
        container.className = 'mcs-page-explorer';

        container.innerHTML = `
            <div class="explorer-path">
                <span class="path-home" data-path="/" title="Home">🏠</span>
                <span class="path-root" data-path="/">root</span>
                <span id="mcs-page-path"></span>
                <span class="path-counter" id="mcs-page-counter">0 items</span>
            </div>
            <div class="explorer-toolbar">
                <div class="toolbar-left">
                    <label style="display:flex; align-items:center; gap:4px; color:#aaa; font-size:12px; cursor:pointer;">
                        <input type="checkbox" id="mcs-select-all" style="cursor:pointer;"> Select All
                    </label>
                </div>
                <div class="toolbar-right">
                    <button class="btn-upload" data-action="upload">Upload</button>
                    <button class="btn-mkdir" data-action="mkdir">New Folder</button>
                    <button class="btn-delete" data-action="delete">Delete</button>
                    <button class="btn-rename" data-action="rename">Rename</button>
                    <button class="btn-refresh" data-action="refresh">Refresh</button>
                    <span class="explorer-status" id="mcs-page-status">Ready</span>
                </div>
            </div>
            <div class="explorer-list" id="mcs-page-list">
                <div class="explorer-loading">Loading...</div>
            </div>
            <div class="explorer-resize-handle" id="mcs-explorer-resize-handle"></div>
        `;

        /* targetEl.parentNode.insertBefore(container, thirdEl.nextSibling); */
        targetEl.parentNode.appendChild(container);

        const token = getBearerToken();
        if (!token) {
            document.getElementById('mcs-page-list').innerHTML = '<div class="explorer-error">❌ No bearer token. Please log in.</div>';
            return;
        }

        const apiBase = `https://api.mcserverhost.com/user/servers/${uuid}`;
        let currentPath = '/';
        let entries = [];
        let selectedItems = new Set();
        let selectAllCheckbox = document.getElementById('mcs-select-all');
        let loadingPaths = new Set(); // debounce duplicate loads

        const pathEl = document.querySelector('#mcs-page-path');
        const listEl = document.getElementById('mcs-page-list');
        const counterEl = document.getElementById('mcs-page-counter');
        const statusEl = document.getElementById('mcs-page-status');
        const resizeHandle = document.getElementById('mcs-explorer-resize-handle');

        // ----- Resize logic -----
        let isResizing = false;
        let startY, startHeight;

        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            startY = e.clientY;
            startHeight = container.offsetHeight;
            document.body.style.cursor = 'ns-resize';
            document.body.style.userSelect = 'none';
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            const delta = e.clientY - startY;
            const newHeight = Math.max(200, startHeight + delta);
            container.style.height = newHeight + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
            }
        });

        // ----- Status & logging (moved to bottom) -----
        function setStatus(msg, isError = false) {
            statusEl.textContent = msg;
            statusEl.style.color = isError ? '#ef9a9a' : '#90caf9';
        }

        function updateCounter() {
            const total = entries.length;
            const selected = selectedItems.size;
            counterEl.textContent = `${selected} / ${total} items`;
            // Also show in status (bottom)
            setStatus(`Loaded ${total} items`);
        }

        // ----- Cached loading -----
        async function loadDirectory(path, forceRefresh = false) {
            // Debounce: prevent multiple simultaneous loads of the same path
            if (loadingPaths.has(path) && !forceRefresh) {
                console.log(`[Cache] Skipping duplicate load for ${path}`);
                return;
            }

            // Check cache first (unless force refresh)
            if (!forceRefresh && explorerCache.has(path)) {
                const cached = explorerCache.get(path);
                console.log(`[Cache] Using cached data for ${path} (${cached.entries.length} items)`);
                entries = cached.entries;
                currentPath = path;
                selectedItems.clear();
                if (selectAllCheckbox) selectAllCheckbox.checked = false;
                renderPath(path);
                renderList(entries);
                updateCounter();
                setStatus(`Loaded ${entries.length} items from cache`);
                return;
            }

            loadingPaths.add(path);
            setStatus(`Loading ${path}...`);
            listEl.innerHTML = '<div class="explorer-loading">Loading...</div>';

            try {
                const url = `${apiBase}/files/list-directory?directory=${encodeURIComponent(path)}`;
                const resp = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

                const data = await resp.json();
                entries = data;
                currentPath = path;
                selectedItems.clear();
                if (selectAllCheckbox) selectAllCheckbox.checked = false;

                // Store in cache
                explorerCache.set(path, { entries: data, timestamp: Date.now() });

                renderPath(path);
                renderList(data);
                updateCounter();
                setStatus(`Loaded ${data.length} items`);
            } catch (err) {
                console.error('Load error:', err);
                listEl.innerHTML = `<div class="explorer-error">❌ Failed to load: ${err.message}</div>`;
                setStatus(`Error: ${err.message}`, true);
            } finally {
                loadingPaths.delete(path);
            }
        }

        // ----- Render path with spaced separators -----
        function renderPath(path) {
            const parts = path === '/' ? [] : path.split('/').filter(p => p);
            let html = '';
            let cumulative = '';
            for (const part of parts) {
                cumulative += '/' + part;
                html += `<span class="path-sep"> / </span>`;
                html += `<span class="path-segment" data-path="${cumulative}">${part}</span>`;
            }
            pathEl.innerHTML = html;
            // Click events
            pathEl.querySelectorAll('[data-path]').forEach(el => {
                el.addEventListener('click', (e) => {
                    const p = el.dataset.path;
                    if (p !== currentPath) {
                        loadDirectory(p);
                    }
                });
            });
            // Home and root clicks (with debounce)
            const homeBtn = container.querySelector('.path-home');
            const rootBtn = container.querySelector('.path-root');
            const goHome = () => { if (currentPath !== '/') loadDirectory('/'); };
            homeBtn.addEventListener('click', goHome);
            rootBtn.addEventListener('click', goHome);
        }

        // ----- Render list (unchanged except user-select) -----
        function renderList(data) {
            if (!data || data.length === 0) {
                listEl.innerHTML = '<div class="explorer-empty">Empty.</div>';
                return;
            }

            const sorted = [...data].sort((a, b) => {
                if (a.directory && !b.directory) return -1;
                if (!a.directory && b.directory) return 1;
                return a.name.localeCompare(b.name);
            });

            let html = '';
            for (const item of sorted) {
                const isFolder = item.directory;
                const icon = isFolder ? '📁' : '📄';
                const size = isFolder ? '' : formatSize(item.size);
                const date = formatDate(item.modified);
                const name = item.name;
                const path = currentPath === '/' ? '/' + name : currentPath + '/' + name;
                const checked = selectedItems.has(path) ? 'checked' : '';

                html += `
                    <div class="explorer-item ${isFolder ? 'folder' : 'file'} ${checked ? 'selected' : ''}" data-path="${path}" data-type="${isFolder ? 'folder' : 'file'}" data-name="${name}">
                        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; flex:1; user-select:none;">
                            <input type="checkbox" class="item-checkbox" data-path="${path}" ${checked} style="cursor:pointer;">
                            <span class="item-icon">${icon}</span>
                            <span class="item-name">${name}</span>
                            <span class="item-size">${size}</span>
                            <span class="item-date">${date}</span>
                        </label>
                    </div>
                `;
            }
            listEl.innerHTML = html;

            // Attach events
            listEl.querySelectorAll('.explorer-item').forEach(el => {
                const path = el.dataset.path;
                const type = el.dataset.type;
                const checkbox = el.querySelector('.item-checkbox');

                el.addEventListener('click', (e) => {
                    if (e.target.closest('.item-checkbox')) return;
                    if (type === 'folder') {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    } else {
                        checkbox.checked = !checkbox.checked;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                });

                el.addEventListener('dblclick', (e) => {
                    if (type === 'folder') {
                        loadDirectory(path);
                    } else {
                        const url = `${apiBase}/files/contents?file=${encodeURIComponent(path)}`;
                        window.open(url, '_blank');
                        setStatus(`Downloading: ${path}`);
                    }
                });

                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation();
                    if (checkbox.checked) {
                        selectedItems.add(path);
                        el.classList.add('selected');
                    } else {
                        selectedItems.delete(path);
                        el.classList.remove('selected');
                    }
                    updateSelectAllState();
                    updateCounter();
                });

                el.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    if (!checkbox.checked) {
                        checkbox.checked = true;
                        selectedItems.add(path);
                        el.classList.add('selected');
                        updateSelectAllState();
                        updateCounter();
                    }
                    showContextMenu(e, { path, name: el.dataset.name, type });
                });
            });

            updateSelectAllState();
            updateCounter();
        }

        // Select All logic
        function updateSelectAllState() {
            if (!selectAllCheckbox) return;
            const checkboxes = listEl.querySelectorAll('.item-checkbox');
            if (checkboxes.length === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
                return;
            }
            const checked = listEl.querySelectorAll('.item-checkbox:checked');
            if (checked.length === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            } else if (checked.length === checkboxes.length) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = true;
            }
        }

        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                const checked = e.target.checked;
                listEl.querySelectorAll('.item-checkbox').forEach(cb => {
                    cb.checked = checked;
                    cb.dispatchEvent(new Event('change'));
                });
            });
        }

        // Toolbar actions
        async function handleAction(action) {
            switch (action) {
                case 'refresh':
                    await loadDirectory(currentPath, true);
                    break;
                case 'mkdir':
                    const folderName = prompt('Enter new folder name:');
                    if (!folderName) return;
                    try {
                        const url = `${apiBase}/files/create-folder`;
                        const resp = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ name: folderName, path: currentPath })
                        });
                        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                        explorerCache.delete(currentPath);
                        await loadDirectory(currentPath, true);
                        setStatus(`✅ Created folder: ${folderName}`);
                    } catch (err) {
                        setStatus(`❌ Failed to create folder: ${err.message}`, true);
                    }
                    break;
                case 'delete':
                    if (selectedItems.size === 0) {
                        setStatus('⚠️ No items selected', true);
                        return;
                    }
                    if (!confirm(`Delete ${selectedItems.size} item(s)?`)) return;
                    const deletePromises = [];
                    selectedItems.forEach(path => {
                        const url = `${apiBase}/files/delete?file=${encodeURIComponent(path)}`;
                        deletePromises.push(fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }));
                    });
                    try {
                        await Promise.all(deletePromises);
                        selectedItems.clear();
                        explorerCache.delete(currentPath);
                        await loadDirectory(currentPath, true);
                        setStatus(`✅ Deleted successfully`);
                    } catch (err) {
                        setStatus(`❌ Delete failed: ${err.message}`, true);
                    }
                    break;
                case 'rename':
                    if (selectedItems.size !== 1) {
                        setStatus('⚠️ Please select exactly one item to rename', true);
                        return;
                    }
                    const itemPath = [...selectedItems][0];
                    const itemName = entries.find(e => (currentPath === '/' ? '/' + e.name : currentPath + '/' + e.name) === itemPath)?.name;
                    if (!itemName) {
                        setStatus('❌ Item not found', true);
                        return;
                    }
                    const newName = prompt(`Rename "${itemName}" to:`, itemName);
                    if (!newName || newName === itemName) return;
                    try {
                        const url = `${apiBase}/files/rename`;
                        const resp = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ from: itemPath, to: currentPath === '/' ? '/' + newName : currentPath + '/' + newName })
                        });
                        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                        selectedItems.clear();
                        explorerCache.delete(currentPath);
                        await loadDirectory(currentPath, true);
                        setStatus(`✅ Renamed to: ${newName}`);
                    } catch (err) {
                        setStatus(`❌ Rename failed: ${err.message}`, true);
                    }
                    break;
                case 'upload':
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.style.display = 'none';
                    document.body.appendChild(fileInput);
                    fileInput.click();
                    fileInput.onchange = async function() {
                        if (!this.files || this.files.length === 0) return;
                        const file = this.files[0];
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('path', currentPath);
                        try {
                            const url = `${apiBase}/files/upload`;
                            const resp = await fetch(url, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}` },
                                body: formData
                            });
                            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                            explorerCache.delete(currentPath);
                            await loadDirectory(currentPath, true);
                            setStatus(`✅ Uploaded: ${file.name}`);
                        } catch (err) {
                            setStatus(`❌ Upload failed: ${err.message}`, true);
                        }
                        document.body.removeChild(fileInput);
                    };
                    break;
                default:
                    console.warn('Unknown action:', action);
            }
        }

        // Context menu actions
        async function handleContextAction(action, itemData) {
            if (!itemData) return;
            const { path, name } = itemData;
            switch (action) {
                case 'rename':
                    if (selectedItems.size !== 1) {
                        setStatus('⚠️ Please select exactly one item to rename', true);
                        return;
                    }
                    const newName = prompt(`Rename "${name}" to:`, name);
                    if (!newName || newName === name) return;
                    try {
                        const url = `${apiBase}/files/rename`;
                        const resp = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ from: path, to: currentPath === '/' ? '/' + newName : currentPath + '/' + newName })
                        });
                        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                        selectedItems.clear();
                        explorerCache.delete(currentPath);
                        await loadDirectory(currentPath, true);
                        setStatus(`✅ Renamed to: ${newName}`);
                    } catch (err) {
                        setStatus(`❌ Rename failed: ${err.message}`, true);
                    }
                    break;
                case 'download':
                    const url = `${apiBase}/files/contents?file=${encodeURIComponent(path)}`;
                    window.open(url, '_blank');
                    setStatus(`Downloading: ${path}`);
                    break;
                case 'archive':
                    setStatus('📦 Archive feature coming soon', true);
                    break;
                case 'delete':
                    if (!confirm(`Delete "${name}"?`)) return;
                    try {
                        const deleteUrl = `${apiBase}/files/delete?file=${encodeURIComponent(path)}`;
                        const resp = await fetch(deleteUrl, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
                        selectedItems.delete(path);
                        explorerCache.delete(currentPath);
                        await loadDirectory(currentPath, true);
                        setStatus(`✅ Deleted: ${name}`);
                    } catch (err) {
                        setStatus(`❌ Delete failed: ${err.message}`, true);
                    }
                    break;
                default:
                    console.warn('Unknown context action:', action);
            }
        }

        // Attach toolbar events
        container.querySelectorAll('.explorer-toolbar button').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                handleAction(action);
            });
        });

        // Initial load
        loadDirectory('/');
        pageExplorerInjected = true;
        pageExplorerInstance = container;
    }

    // #########################
    // HELPERS
    // #########################
    function log(msg, type = 'info') {
        statusArea.textContent = msg;
        statusArea.className = 'status-area';
        if (type === 'success') statusArea.classList.add('success');
        else if (type === 'error') statusArea.classList.add('error');
    }

    function generateCsrfToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    function getBearerToken() {
        return localStorage.getItem('token');
    }

    // #########################
    // TURNSTILE
    // #########################
    function getTurnstileTokenViaInjection() {
        return new Promise((resolve) => {
            const eventName = 'mcs_turnstile_token_' + Date.now();
            const handler = (e) => {
                window.removeEventListener(eventName, handler);
                resolve(e.detail || null);
            };
            window.addEventListener(eventName, handler);

            const script = document.createElement('script');
            script.textContent = `
                (function() {
                    try {
                        var token = window.turnstile ? window.turnstile.getResponse() : null;
                        window.dispatchEvent(new CustomEvent('${eventName}', { detail: token }));
                    } catch (e) {
                        window.dispatchEvent(new CustomEvent('${eventName}', { detail: null }));
                    }
                })();
            `;
            document.head.appendChild(script);
            document.head.removeChild(script);

            setTimeout(() => {
                window.removeEventListener(eventName, handler);
                resolve(null);
            }, 1000);
        });
    }

    async function updateCaptchaToken() {
        const token = await getTurnstileTokenViaInjection();
        if (token) {
            captchaInput.value = token;
            tokenStatus.textContent = '✅ Turnstile token captured';
            tokenStatus.className = 'token-status ok';
            return true;
        } else {
            tokenStatus.textContent = '⏳ Solve the Turnstile challenge first';
            tokenStatus.className = 'token-status';
            return false;
        }
    }

    let captchaInterval = setInterval(updateCaptchaToken, 2000);

    refreshBtn.addEventListener('click', async () => {
        await updateCaptchaToken();
        if (captchaInput.value) {
            log('Captcha token updated', 'success');
        } else {
            log('No captcha token found. Solve the Turnstile.', 'error');
        }
    });

    async function refreshAll() {
        await updateCaptchaToken();
        updateTokenUI();
        await updateServerDetails();
        await fetchSpinStatus();
        log('✅ Refreshed captcha, token, UUID, node info, and spin status.', 'success');
    }

    refreshAllBtn.addEventListener('click', refreshAll);

    // #########################
    // SUBMIT HANDLER (CREATE SERVER)
    // #########################
    submitBtn.addEventListener('click', async function(e) {
        e.preventDefault();

        const token = getBearerToken();
        if (!token) {
            log('❌ No bearer token found in localStorage. Please log in first.', 'error');
            return;
        }

        const captcha = captchaInput.value.trim();
        if (!captcha) {
            log('❌ Captcha token is empty. Please solve the Turnstile.', 'error');
            return;
        }

        const payload = {
            server_name: serverNameInput.value.trim() || 'MCServerHost Server',
            description: descInput.value.trim() || '',
            location_id: parseInt(locationInput.value) || 21,
            egg_id: parseInt(eggInput.value) || 107,
            version: versionInput.value.trim() || '1.21.11',
            docker_image: dockerInput.value.trim() || 'Java 25',
            subdomain: subdomainInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
            captcha_token: captcha
        };

        if (!payload.subdomain) {
            log('❌ Subdomain cannot be empty.', 'error');
            return;
        }

        const csrfToken = generateCsrfToken();
        const url = 'https://api.mcserverhost.com/user/create-free-server';

        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Sending...';
        log('⏳ Sending request...');

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || data.error || `HTTP ${response.status}`);
            }

            log(`✅ Server created! ID: ${data.id || data.server_id || 'unknown'}`, 'success');
            console.log('Full response:', data);

        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error');
            console.error('Creation error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Server';
        }
    });

    // #########################
    // INIT
    // #########################
    log('Ready. Toggle panel with 🚀 button.');
    setTimeout(updateCaptchaToken, 1000);

    // #########################
    // CLEANUP
    // #########################
    window.addEventListener('beforeunload', () => {
        clearInterval(captchaInterval);
        stopSpinCountdown();
        if (terminalRetryTimer) {
            clearTimeout(terminalRetryTimer);
            terminalRetryTimer = null;
        }
    });

})();
