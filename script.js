(function () { 
    if (window.__SG_FILTER_LOADED__) return;
    window.__SG_FILTER_LOADED__ = true;
    // ======= DYNAMIC STYLES =======
    if (!document.getElementById("sg-filter-style")) {
        const style = document.createElement("style");
        style.id = "sg-filter-style";
        style.textContent = `
          
          td:focus{outline:none;}
          .filter-icon{font-size:12px;color:#fff;cursor:pointer;margin-left:4px;display:none;}
          .gs-filter-active{background:#bcd7ff !important;}
          .gs-filter-popup{
          position:absolute;background:#fff;border-radius:6px;
          box-shadow:0 4px 12px rgba(0,0,0,0.15);padding:8px;
          font-family:Arial,sans-serif;font-size:13px;display:none;z-index:9999;
          }
          .gs-filter-popup {width: 220px;max-width: 220px;word-wrap: break-word;overflow-wrap: break-word;}
          .gs-values-box {max-height: 160px;overflow-y: auto;overflow-x: hidden; }
          .gs-value-item {
          display: flex;gap: 6px;align-items: flex-start;padding: 4px;
          cursor: pointer;border-radius: 3px;word-break: break-word;white-space: normal;       
          }
          .gs-value-item span {flex: 1;word-break: break-word;white-space: normal;}

          .gs-filter-button{width:100%;border:none;background:#f8f9fa;padding:6px;text-align:left;
          cursor:pointer;border-radius:4px;margin-bottom:4px;transition:background 0.15s;}
          .gs-filter-button:hover{background:#e2e6ea;}
          .gs-select-clear-container{display:flex;gap:10px;margin-bottom:4px;}
          .gs-select-all-text,.gs-clear-text{font-size:12px;cursor:pointer;}
          .gs-select-all-text{color:#007bff;}
          .gs-clear-text{color:#ff4d4f;}
          .gs-search-box{width:92%;padding:6px;margin:4px auto;border-radius:4px;border:1px solid #ccc;display:block;}
          .gs-values-box{max-height:160px;overflow-y:auto;border:1px solid #ccc;border-radius:4px;background:#fff;margin-top:4px;padding:4px;}
          .gs-value-item{display:flex;gap:6px;align-items:center;padding:4px;cursor:pointer;border-radius:3px;}
          .gs-value-item:hover{background:#f1f3f4;}
          .gs-filter-footer{display:flex;justify-content:flex-end;margin-top:8px;gap:8px;}
          .gs-footer-btn{padding:6px 14px;border:1px solid #ccc;border-radius:4px;background:#f8f9fa;cursor:pointer;transition:background 0.15s;}
          .gs-footer-btn:hover{background:#e2e6ea;}
          .gs-condition-select{width:100%; margin-top:4px; padding:4px;}

          /* ===== SELECTION STYLES ===== */
          td.sg-selected {
            background: #c7deff !important;
            outline: none;
          }
          td.sg-anchor {
            background: #a8ccff !important;
            outline: 2px solid #4a89ff;
            outline-offset: -2px;
          }

          /* ===== EDIT MODE ===== */
          td.sg-editing {
            padding: 0 !important;
            background: #fff !important;
            outline: 2px solid #4a89ff !important;
            outline-offset: -2px;
          }
          td.sg-editing input.sg-edit-input,
          td.sg-editing select.sg-edit-input {
            width: 100%;
            height: 100%;
            min-height: 28px;
            border: none;
            outline: none;
            padding: 6px 8px;
            font-size: inherit;
            font-family: inherit;
            background: #fff;
            color: #222;
            box-sizing: border-box;
          }

          /* ===== MOBILE RESPONSIVE ===== */
          @media (max-height: 468px) {
          h2 {font-size: 16px;margin: 10px 0;}
          table {font-size: 12px;}
          th, td {padding: 6px;}
          .filter-icon {font-size: 10px;margin-left: 2px;}
          .gs-filter-popup {font-size: 12px;padding: 6px;border-radius: 4px;}
          .gs-filter-button {padding: 2px;font-size: 12px;margin-bottom: 1px;}
          .gs-search-box {padding: 1px;font-size: 11px;}
          .gs-values-box {max-height: 100px;padding: 3px;}
          .gs-value-item {padding: 1px;font-size: 11px;}
          .gs-footer-btn {padding: 4px 10px;font-size: 11px;}
          .gs-select-all-text,.gs-clear-text {font-size: 11px;}
          .gs-condition-select,.gs-condition-input {font-size: 11px;padding: 0px;}
          .gs-filter-footer {margin-top: 2px}
          }
          `;
        document.head.appendChild(style);
    }

    // ======= COMMON POPUP =======
    const popup = document.createElement("div");
    popup.className = "gs-filter-popup";
    popup.innerHTML = `
      <button class="gs-filter-button" data-sort="asc">Sort A → Z</button>
      <button class="gs-filter-button" data-sort="desc">Sort Z → A</button>

      <div style="margin-top:6px;">
      <label style="font-size:12px;">Filter by Condition:</label>
      <select class="gs-condition-select">
      <option value="none" selected>None</option>
      <option value="gt">Greater Than</option>
      <option value="lt">Less Than</option>
      <option value="gte">Greater Than or Equal</option>
      <option value="lte">Less Than or Equal</option>
      <option value="eq">Equal To</option>
      </select>
      <input type="number" class="gs-condition-input" placeholder="Enter value"
      style="width:95%; margin-top:4px; padding:4px; display:none;">
      </div>

      <div class="gs-select-clear-container">
      <div class="gs-select-all-text">Select All</div>
      <div class="gs-clear-text">Clear</div>
      </div>

      <input class="gs-search-box" type="text" placeholder="Search...">
      <div class="gs-values-box"></div>

      <div class="gs-filter-footer">
      <button class="gs-footer-btn" id="gs-cancel-filter">Cancel</button>
      <button class="gs-footer-btn" id="gs-ok-filter">OK</button>
      </div>
      `;

    const conditionSelect = popup.querySelector(".gs-condition-select");
    const conditionInput  = popup.querySelector(".gs-condition-input");

    conditionSelect.addEventListener("change", () => {
        conditionInput.style.display = conditionSelect.value === "none" ? "none" : "block";
    });

    document.body.appendChild(popup);

    // ======= UNDO HISTORY =======
    const sg_undoStack = new WeakMap();

    function sg_getUndoStack(table) {
        if (!sg_undoStack.has(table)) sg_undoStack.set(table, []);
        return sg_undoStack.get(table);
    }

    function sg_saveSnapshot(table, rMin, rMax, cMin, cMax, rows) {
        const snapshot = [];
        for (let r = rMin; r <= rMax; r++) {
            for (let c = cMin; c <= cMax; c++) {
                const td = rows[r]?.children[c];
                if (td) snapshot.push({ r, c, value: sg_getCellValue(td) });
            }
        }
        sg_getUndoStack(table).push(snapshot);
    }

    // ======= SELECTION STATE =======
    let anchorCell = null;
    let activeCell = null;

    function sg_visibleRows(table) {
        const headersCount = table.querySelectorAll("th").length;
        return [...table.querySelectorAll("tbody tr")]
            .filter(r => r.children.length === headersCount && r.style.display !== "none");
    }

    function sg_paintSelection(table) {
        table.querySelectorAll("td.sg-selected, td.sg-anchor").forEach(td => {
            td.classList.remove("sg-selected", "sg-anchor");
        });

        if (!anchorCell || anchorCell.table !== table) return;

        const rows = sg_visibleRows(table);
        const rMin = Math.min(anchorCell.rowIndex, activeCell.rowIndex);
        const rMax = Math.max(anchorCell.rowIndex, activeCell.rowIndex);
        const cMin = Math.min(anchorCell.colIndex, activeCell.colIndex);
        const cMax = Math.max(anchorCell.colIndex, activeCell.colIndex);

        for (let r = rMin; r <= rMax; r++) {
            for (let c = cMin; c <= cMax; c++) {
                const td = rows[r]?.children[c];
                if (!td) continue;
                if (r === anchorCell.rowIndex && c === anchorCell.colIndex) {
                    td.classList.add("sg-anchor");
                } else {
                    td.classList.add("sg-selected");
                }
            }
        }
    }

    function sg_selectSingle(table, rowIndex, colIndex) {
        anchorCell = { table, rowIndex, colIndex };
        activeCell = { table, rowIndex, colIndex };
        sg_paintSelection(table);
    }

    function sg_extendSelection(table, rowIndex, colIndex) {
        if (!anchorCell || anchorCell.table !== table) {
            sg_selectSingle(table, rowIndex, colIndex);
            return;
        }
        activeCell = { table, rowIndex, colIndex };
        sg_paintSelection(table);
    }

    // ======= EDIT MODE =======
    // sg-fillable columns: store their options list if they are dropdowns
    // We detect dropdown columns by a data attribute on <th>:
    //   data-sg-options="Option A,Option B,Option C"
    // If not set, the cell is treated as a plain text/number input.
    // data-sg-type="number" on <th> makes it a number input.

    function sg_getColMeta(table, colIndex) {
        const ths = table.querySelectorAll("th");
        const th  = ths[colIndex];
        if (!th) return { type: "text", options: null };
        const options = th.dataset.sgOptions
            ? th.dataset.sgOptions.split(",").map(s => s.trim())
            : null;
        const type = th.dataset.sgType || "text";
        return { type, options };
    }

    function sg_commitEdit(td, newValue) {
        // Remove the edit widget, restore display text
        td.classList.remove("sg-editing");
        td.innerHTML = "";
        td.textContent = newValue;
        // Fire a custom event so host pages can react (e.g. save to sheet)
        td.dispatchEvent(new CustomEvent("sg-cell-edited", {
            bubbles: true,
            detail: { td, value: newValue }
        }));
    }

    function sg_enterEditMode(td, table, rowIndex, colIndex) {
        // Only enter edit mode if column is marked sg-fillable
        const headers = table.querySelectorAll("th");
        if (!headers[colIndex]?.classList.contains("sg-fillable")) return;

        // Already editing this cell? do nothing
        if (td.classList.contains("sg-editing")) return;

        const meta        = sg_getColMeta(table, colIndex);
        const currentVal  = td.textContent.trim();

        td.classList.add("sg-editing");
        td.innerHTML = "";

        let widget;
        if (meta.options) {
            widget = document.createElement("select");
            widget.className = "sg-edit-input";
            meta.options.forEach(opt => {
                const o = document.createElement("option");
                o.value = o.textContent = opt;
                if (opt === currentVal) o.selected = true;
                widget.appendChild(o);
            });
            // For dropdowns: commit on change, or on blur
            widget.addEventListener("change", () => {
                sg_commitEdit(td, widget.value);
            });
        } else {
            widget = document.createElement("input");
            widget.className = "sg-edit-input";
            widget.type  = meta.type === "number" ? "number" : "text";
            widget.value = currentVal;
            widget.addEventListener("keydown", e => {
                if (e.key === "Enter") {
                    e.preventDefault();
                    sg_commitEdit(td, widget.value);
                }
                if (e.key === "Escape") {
                    // restore original
                    td.classList.remove("sg-editing");
                    td.innerHTML = "";
                    td.textContent = currentVal;
                }
            });
        }

        widget.addEventListener("blur", () => {
            if (td.classList.contains("sg-editing")) {
                const val = meta.options ? widget.value : widget.value;
                sg_commitEdit(td, val);
            }
        });

        td.appendChild(widget);
        widget.focus();
        if (!meta.options && widget.setSelectionRange) {
            widget.setSelectionRange(widget.value.length, widget.value.length);
        }
    }

    // ======= ATTACH MOUSE EVENTS TO CELLS =======
    function sg_attachCellEvents(table) {
        const rows = sg_visibleRows(table);
        rows.forEach((row, rIdx) => {
            [...row.children].forEach((td, cIdx) => {
                if (td.dataset.sgBound) return;
                td.dataset.sgBound = "1";
                td.setAttribute("tabindex", "0");

                // Single click: select
                td.addEventListener("mousedown", e => {
                    // Don't interfere if user clicked inside an active edit widget
                    if (td.classList.contains("sg-editing")) return;
                    if (popup.contains(e.target)) return;

                    const visRows = sg_visibleRows(table);
                    const visRIdx = visRows.indexOf(row);
                    if (visRIdx === -1) return;

                    if (e.shiftKey && anchorCell && anchorCell.table === table) {
                        sg_extendSelection(table, visRIdx, cIdx);
                    } else {
                        sg_selectSingle(table, visRIdx, cIdx);
                    }

                    td.focus({ preventScroll: false });
                    e.preventDefault();
                });

                // Double click: enter edit mode
                td.addEventListener("dblclick", e => {
                    const visRows = sg_visibleRows(table);
                    const visRIdx = visRows.indexOf(row);
                    if (visRIdx === -1) return;
                    sg_enterEditMode(td, table, visRIdx, cIdx);
                    e.preventDefault();
                });
            });
        });
    }

    // ======= INIT TABLE =======
    let activeTable  = null;
    let activeColumn = null;
    const tableFilters = new WeakMap();

    function sg_initTableFilters(table) {
        if (!table) return;
        tableFilters.set(table, {});
        table.dataset.sgFilterInit = "true";

        table.querySelectorAll("th").forEach((th, index) => {
            if (th.querySelector(".filter-icon")) return;

            const icon = document.createElement("span");
            icon.textContent = "▼";
            icon.className   = "filter-icon";
            icon.style.display = table.getAttribute('data-filter-mode') === 'true' ? 'inline' : 'none';
            th.appendChild(icon);

            icon.addEventListener("click", e => {
                e.stopPropagation();
                activeTable  = table;
                activeColumn = index;
                popup.querySelector(".gs-search-box").value = "";
                sg_buildValueList(table, activeColumn);
                sg_positionPopup(icon);
                popup.style.display = "block";
            });
        });

        sg_attachCellEvents(table);
    }

    document.querySelectorAll(".data-table").forEach(table => {
        sg_initTableFilters(table);
    });

    // ======= POSITION POPUP =======
    function sg_positionPopup(icon) {
        const th   = icon.closest("th");
        const rect = th.getBoundingClientRect();
        const scrollTop  = window.pageYOffset  || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        popup.style.visibility = "hidden";
        popup.style.display    = "block";
        const popupWidth = popup.offsetWidth;

        let left = rect.left + scrollLeft;
        if (rect.left + popupWidth > window.innerWidth) {
            left = rect.right + scrollLeft - popupWidth;
        }

        popup.style.left       = left + "px";
        popup.style.top        = rect.bottom + scrollTop + "px";
        popup.style.visibility = "visible";
    }

    // ======= TOGGLE FILTER =======
    window.sg_toggleFilter = function (tableId) {
        const table = document.getElementById(tableId);
        if (!table) return;
        const current = table.getAttribute('data-filter-mode') === 'true';
        table.setAttribute('data-filter-mode', !current);

        table.querySelectorAll('th .filter-icon').forEach(icon => {
            icon.style.display = !current ? 'inline' : 'none';
        });

        if (current) {
            tableFilters.set(table, {});
            sg_applyFilters(table);
            sg_styleFilterIcons(table);
        }
    };

    // ======= BUILD VALUE LIST =======
    function sg_buildValueList(table, col) {
        const container    = popup.querySelector(".gs-values-box");
        container.innerHTML = "";

        const filters      = tableFilters.get(table);
        const headersCount = table.querySelectorAll("th").length;
        const rows = [...table.querySelectorAll("tbody tr")].filter(row => row.children.length === headersCount);
        const data = rows.map(row => [...row.children].map(cell => sg_getCellValue(cell)));

        const allRows = rows.filter((row, rowIndex) => {
            for (const colIndex in filters) {
                if (Number(colIndex) === col) continue;
                const filterObj = filters[colIndex];
                if (!filterObj) continue;
                const rawValue  = data[rowIndex][colIndex];
                const cellValue = rawValue === "" ? "(Blank)" : rawValue;
                if (filterObj.values && !filterObj.values.includes(cellValue)) return false;
                if (filterObj.condition && rawValue !== "") {
                    const num     = sg_parseNumber(rawValue);
                    const condVal = filterObj.condition.value;
                    switch (filterObj.condition.type) {
                        case "gt":  if (!(num >  condVal)) return false; break;
                        case "lt":  if (!(num <  condVal)) return false; break;
                        case "gte": if (!(num >= condVal)) return false; break;
                        case "lte": if (!(num <= condVal)) return false; break;
                        case "eq":  if (!(num === condVal)) return false; break;
                    }
                }
            }
            return true;
        });

        const valueMap = new Map();
        allRows.forEach(r => {
            const raw = sg_getCellValue(r.children[col]);
            const key = raw.toLowerCase();
            if (!valueMap.has(key)) valueMap.set(key, raw);
        });

        const allValues = [...valueMap.values()].sort((a, b) => {
            const numA = parseFloat(a), numB = parseFloat(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
        });

        const showBlank      = allValues.includes("");
        const nonBlankValues = allValues.filter(v => v !== "");
        const filterObj      = tableFilters.get(table)[col];
        const hasValueFilter = !!filterObj?.values;
        const saved          = filterObj?.values || [];

        const selectAllText = popup.querySelector(".gs-select-all-text");
        const clearText     = popup.querySelector(".gs-clear-text");

        function sg_updateSelectAllColor() {
            const allCbs = [...container.querySelectorAll("input[type=checkbox]")];
            selectAllText.style.color = allCbs.every(cb => cb.checked) ? "#007bff" : "#666";
        }

        function addItem(v, checked) {
            const item = document.createElement("div");
            item.className = "gs-value-item";
            item.innerHTML = `<input type="checkbox" ${checked ? "checked" : ""}> <span>${v}</span>`;
            container.appendChild(item);
            item.addEventListener("click", e => {
                if (e.target.tagName !== "INPUT")
                    item.querySelector("input").checked = !item.querySelector("input").checked;
                sg_updateSelectAllColor();
            });
        }

        if (hasValueFilter) {
            saved.forEach(v => { if (v !== "(Blank)" && allValues.includes(v)) addItem(v, true); });
        }
        nonBlankValues.forEach(v => { if (!saved.includes(v)) addItem(v, !hasValueFilter); });
        if (showBlank) addItem("(Blank)", hasValueFilter ? saved.includes("(Blank)") : true);

        selectAllText.onclick = () => {
            [...container.querySelectorAll(".gs-value-item")]
                .filter(d => d.style.display !== "none")
                .forEach(d => d.querySelector("input").checked = true);
            sg_updateSelectAllColor();
        };
        clearText.onclick = () => {
            [...container.querySelectorAll(".gs-value-item")]
                .filter(d => d.style.display !== "none")
                .forEach(d => d.querySelector("input").checked = false);
            sg_updateSelectAllColor();
        };

        sg_updateSelectAllColor();
        popup.querySelector(".gs-search-box").value = "";

        const condition = filterObj?.condition;
        if (condition) {
            conditionSelect.value          = condition.type;
            conditionInput.style.display   = "block";
            conditionInput.value           = condition.value;
        } else {
            conditionSelect.value          = "none";
            conditionInput.value           = "";
            conditionInput.style.display   = "none";
        }
    }

    // ======= HELPERS =======
    function sg_toProperCase(str) {
        return str.toLowerCase().split(" ").filter(Boolean)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    }

    function sg_parseNumber(value) {
        if (value === null || value === undefined) return NaN;
        return parseFloat(value.toString().replace(/[^0-9.\-]/g, ""));
    }

    // FIX: getCellValue reads plain textContent only (no inputs/selects in cells anymore)
    function sg_getCellValue(cell) {
        if (!cell) return "";
        // If cell is in edit mode, read the live widget value
        const editWidget = cell.querySelector(".sg-edit-input");
        if (editWidget) {
            return editWidget.tagName === "SELECT"
                ? editWidget.value
                : editWidget.value.trim();
        }
        const numericSpan = cell.querySelector(".numeric-value");
        if (numericSpan) return numericSpan.dataset.raw.trim();
        return sg_toProperCase(cell.textContent.trim());
    }

    function sg_setCellValue(cell, value) {
        if (!cell) return;
        const numericSpan = cell.querySelector(".numeric-value");
        if (numericSpan) { numericSpan.dataset.raw = value; numericSpan.textContent = value; return; }
        // If in edit mode, update the widget and commit
        const editWidget = cell.querySelector(".sg-edit-input");
        if (editWidget) {
            editWidget.value = value;
            sg_commitEdit(cell, value);
            return;
        }
        // Plain cell
        cell.textContent = value;
    }

    // ======= SEARCH =======
    popup.querySelector(".gs-search-box").addEventListener("input", () => {
        const text = popup.querySelector(".gs-search-box").value.toLowerCase();
        [...popup.querySelectorAll(".gs-value-item")].forEach(div => {
            div.style.display = div.textContent.toLowerCase().includes(text) ? "flex" : "none";
        });
    });

    // ======= OK FILTER =======
    popup.querySelector("#gs-ok-filter").addEventListener("click", () => {
        if (!activeTable) return;
        const container      = popup.querySelector(".gs-values-box");
        const checkboxes     = [...container.querySelectorAll("input[type=checkbox]")];
        const selectedValues = checkboxes.map(cb => cb.checked ? cb.parentElement.innerText.trim() : null).filter(v => v !== null);
        const conditionType  = conditionSelect.value;
        const conditionValue = conditionInput.value;
        const tableFilterObj = tableFilters.get(activeTable);

        if (selectedValues.length === checkboxes.length) {
            delete tableFilterObj[activeColumn]?.values;
        } else {
            tableFilterObj[activeColumn] = tableFilterObj[activeColumn] || {};
            tableFilterObj[activeColumn].values = selectedValues;
        }

        if (conditionType !== "none" && conditionValue !== "") {
            tableFilterObj[activeColumn] = tableFilterObj[activeColumn] || {};
            tableFilterObj[activeColumn].condition = { type: conditionType, value: parseFloat(conditionValue) };
        } else {
            if (tableFilterObj[activeColumn]) delete tableFilterObj[activeColumn].condition;
        }

        sg_applyFilters(activeTable);
        sg_styleFilterIcons(activeTable);
        popup.style.display = "none";
    });

    popup.querySelector("#gs-cancel-filter").addEventListener("click", () => {
        popup.style.display = "none";
    });

    // ======= SORT =======
    popup.querySelectorAll("[data-sort]").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!activeTable) return;
            const col   = activeColumn;
            const dir   = btn.dataset.sort;
            const table = activeTable;
            const rows  = [...table.querySelectorAll("tbody tr")].filter(r => r.style.display !== "none");

            rows.sort((a, b) => {
                const Araw = sg_getCellValue(a.children[col]);
                const Braw = sg_getCellValue(b.children[col]);
                const Anum = sg_parseNumber(Araw);
                const Bnum = sg_parseNumber(Braw);
                if (!isNaN(Anum) && !isNaN(Bnum)) return dir === "asc" ? Anum - Bnum : Bnum - Anum;
                return dir === "asc" ? Araw.localeCompare(Braw) : Braw.localeCompare(Araw);
            });

            const tbody = table.querySelector("tbody");
            rows.forEach(r => tbody.appendChild(r));
            popup.style.display = "none";
        });
    });

    // ======= APPLY FILTERS =======
    function sg_applyFilters(table) {
        const filters      = tableFilters.get(table);
        const headersCount = table.querySelectorAll("th").length;
        const rows = [...table.querySelectorAll("tbody tr")].filter(row => row.children.length === headersCount);
        const data = rows.map(row => [...row.children].map(cell => sg_getCellValue(cell)));

        for (let i = 0; i < rows.length; i++) {
            let show = true;
            for (const col in filters) {
                const filterObj = filters[col];
                if (!filterObj) continue;
                const rawValue  = data[i][col];
                const cellValue = rawValue === "" ? "(Blank)" : rawValue;
                if (filterObj.values && !filterObj.values.includes(cellValue)) { show = false; break; }
                if (filterObj.condition && rawValue !== "") {
                    const num     = sg_parseNumber(rawValue);
                    const condVal = filterObj.condition.value;
                    switch (filterObj.condition.type) {
                        case "gt":  if (!(num >  condVal)) show = false; break;
                        case "lt":  if (!(num <  condVal)) show = false; break;
                        case "gte": if (!(num >= condVal)) show = false; break;
                        case "lte": if (!(num <= condVal)) show = false; break;
                        case "eq":  if (!(num === condVal)) show = false; break;
                    }
                    if (!show) break;
                }
            }
            rows[i].style.display = show ? "" : "none";
        }
        sg_attachCellEvents(table);
    }

    // ======= STYLE FILTER ICONS =======
    function sg_styleFilterIcons(table) {
        const filters = tableFilters.get(table);
        table.querySelectorAll("th .filter-icon").forEach((icon, i) => {
            const filterObj = filters[i];
            const isActive  = filterObj && ((filterObj.values?.length > 0) || filterObj.condition);
            icon.classList.toggle("gs-filter-active", !!isActive);
        });
    }

    // ======= CLOSE POPUP =======
    document.addEventListener("click", e => {
        if (!popup.contains(e.target)) popup.style.display = "none";
    });

    function sg_makeCellsFocusable(table) {
        table.querySelectorAll("tbody td").forEach(td => td.setAttribute("tabindex", "0"));
    }

    // ======= KEYBOARD: ARROWS + CTRL+D + CTRL+Z =======
    document.addEventListener("keydown", e => {
        if (!anchorCell) return;
        const table = anchorCell.table;
        if (!table || !table.classList.contains("data-table")) return;

        // If a cell is being edited, let the edit widget handle keyboard normally
        const editingCell = table.querySelector("td.sg-editing");
        if (editingCell) return;

        const rows   = sg_visibleRows(table);
        const maxRow = rows.length - 1;
        const maxCol = (rows[0]?.children.length ?? 1) - 1;

        // ---- Ctrl+Z : undo fill-down ----
        if (e.ctrlKey && e.key === "z") {
            e.preventDefault();
            const stack = sg_getUndoStack(table);
            if (!stack.length) return;
            const snapshot = stack.pop();
            snapshot.forEach(({ r, c, value }) => {
                const td = rows[r]?.children[c];
                if (td) sg_setCellValue(td, value);
            });
            return;
        }

        // ---- Ctrl+D : fill down ----
        if (e.ctrlKey && e.key === "d") {
            e.preventDefault();

            const headers = [...table.querySelectorAll("th")];
            const rMin = Math.min(anchorCell.rowIndex, activeCell.rowIndex);
            const rMax = Math.max(anchorCell.rowIndex, activeCell.rowIndex);
            const cMin = Math.min(anchorCell.colIndex, activeCell.colIndex);
            const cMax = Math.max(anchorCell.colIndex, activeCell.colIndex);

            const fillableCols = [];
            for (let c = cMin; c <= cMax; c++) {
                if (headers[c]?.classList.contains("sg-fillable")) fillableCols.push(c);
            }
            if (!fillableCols.length) return;

            // Snapshot before fill
            const snapshot = [];
            for (let c of fillableCols) {
                for (let r = rMin + 1; r <= rMax; r++) {
                    const td = rows[r]?.children[c];
                    if (td) snapshot.push({ r, c, value: sg_getCellValue(td) });
                }
            }
            sg_getUndoStack(table).push(snapshot);

            // Fill: copy plain text value from source cell
            for (let c of fillableCols) {
                // FIX: always read the committed text value, never innerHTML
                const sourceTd    = rows[rMin]?.children[c];
                const editWidget  = sourceTd?.querySelector(".sg-edit-input");
                const sourceValue = editWidget? editWidget.value : (sourceTd?.textContent.trim() ?? "");
                for (let r = rMin + 1; r <= rMax; r++) {
                    const td = rows[r]?.children[c];
                    if (td) {
                        // If this is a dropdown column, validate value exists in options
                        const meta = sg_getColMeta(table, c);
                        const safeValue = meta.options
                            ? (meta.options.includes(sourceValue) ? sourceValue : meta.options[0])
                            : sourceValue;
                        sg_setCellValue(td, safeValue);
                    }
                }
            }
            return;
        }

        // ---- F2 : enter edit mode on anchor cell ----
        if (e.key === "F2") {
            e.preventDefault();
            const td = rows[anchorCell.rowIndex]?.children[anchorCell.colIndex];
            if (td) sg_enterEditMode(td, table, anchorCell.rowIndex, anchorCell.colIndex);
            return;
        }

        // ---- Arrow keys ----
        const arrowKeys = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"];
        if (!arrowKeys.includes(e.key)) return;
        e.preventDefault();

        const curRow = activeCell.rowIndex;
        const curCol = activeCell.colIndex;
        let   newRow = curRow;
        let   newCol = curCol;

        switch (e.key) {
            case "ArrowDown":  newRow = e.ctrlKey ? maxRow : Math.min(curRow + 1, maxRow); break;
            case "ArrowUp":    newRow = e.ctrlKey ? 0      : Math.max(curRow - 1, 0);      break;
            case "ArrowRight": newCol = e.ctrlKey ? maxCol : Math.min(curCol + 1, maxCol); break;
            case "ArrowLeft":  newCol = e.ctrlKey ? 0      : Math.max(curCol - 1, 0);      break;
        }

        if (e.shiftKey) {
            sg_extendSelection(table, newRow, newCol);
        } else {
            sg_selectSingle(table, newRow, newCol);
        }

        const td = rows[activeCell.rowIndex]?.children[activeCell.colIndex];
        if (td) td.focus({ preventScroll: false });
    });

    // ======= CLEAR SELECTION WHEN CLICKING OUTSIDE =======
    document.addEventListener("mousedown", e => {
        if (!e.target.closest(".data-table")) {
            if (anchorCell) {
                anchorCell.table.querySelectorAll("td.sg-selected, td.sg-anchor")
                    .forEach(td => td.classList.remove("sg-selected", "sg-anchor"));
            }
            anchorCell = null;
            activeCell = null;
        }
    });

    // ===== AUTO INIT FOR DYNAMIC TABLES =====
    let sgObserverTimeout;
    const observer = new MutationObserver(() => {
        clearTimeout(sgObserverTimeout);
        sgObserverTimeout = setTimeout(() => {
            document.querySelectorAll(".data-table").forEach(table => {
                if (table.dataset.sgFilterInit === "true") {
                    sg_attachCellEvents(table);
                    return;
                }
                sg_initTableFilters(table);
                sg_makeCellsFocusable(table);
            });
        }, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
