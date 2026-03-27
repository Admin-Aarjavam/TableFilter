(function () {
    if (window.__SG_FILTER_LOADED__) return;
    window.__SG_FILTER_LOADED__ = true;
    // ======= DYNAMIC STYLES =======
    if (!document.getElementById("sg-filter-style")) {
        const style = document.createElement("style");
        style.id = "sg-filter-style";
        style.textContent = `
          table{border-collapse:collapse;width:100%;margin-bottom:20px;}
          th,td{padding:8px;border:1px solid #ddd;font-family:Arial,sans-serif;}
          td:focus{outline:2px solid #4a89ff;background:#eef5ff;}
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

      <!-- NEW CONDITION FILTER -->
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
    const conditionInput = popup.querySelector(".gs-condition-input");

    conditionSelect.addEventListener("change", () => {
        if (conditionSelect.value === "none") {
            conditionInput.style.display = "none";
        } else {
            conditionInput.style.display = "block";
        }
    });

    document.body.appendChild(popup);

    function sg_initTableFilters(table) {

        if (!table) return;

        tableFilters.set(table, {});
        table.dataset.sgFilterInit = "true";

        table.querySelectorAll("th").forEach((th, index) => {

            // Only add icon if missing
            if (th.querySelector(".filter-icon")) return;

            const icon = document.createElement("span");
            icon.textContent = "▼";
            icon.className = "filter-icon";
            icon.style.display = table.getAttribute('data-filter-mode') === 'true'
                ? 'inline'
                : 'none';

            th.appendChild(icon);

            icon.addEventListener("click", e => {
                e.stopPropagation();

                activeTable = table;
                activeColumn = index;

                popup.querySelector(".gs-search-box").value = "";

                sg_buildValueList(table, activeColumn);
                sg_positionPopup(icon);
                popup.style.display = "block";
            });
        });
    }

    let activeTable = null, activeColumn = null;
    const tableFilters = new WeakMap();

    const tableDataCache = new WeakMap();

    // ======= INITIAL TABLE SETUP =======
    document.querySelectorAll(".data-table").forEach(table => {
        sg_initTableFilters(table);

    });


    // ======= POSITION POPUP FUNCTION =======
    function sg_positionPopup(icon) {
        const th = icon.closest("th");
        const rect = th.getBoundingClientRect();

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        // STEP 1: Show invisibly to get correct width
        popup.style.visibility = "hidden";
        popup.style.display = "block";

        const popupWidth = popup.offsetWidth;

        // STEP 2: Calculate position
        let left = rect.left + scrollLeft;

        if (rect.left + popupWidth > window.innerWidth) {
            // shift to left side
            left = rect.right + scrollLeft - popupWidth;
        }

        // STEP 3: Apply final position
        popup.style.left = left + "px";
        popup.style.top = rect.bottom + scrollTop + "px";

        // STEP 4: Show properly
        popup.style.visibility = "visible";
    }

    // ======= TOGGLE FILTER FUNCTION =======
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
    }

    function sg_buildValueList(table, col) {

        const container = popup.querySelector(".gs-values-box");
        container.innerHTML = "";

        // Get all rows
        const filters = tableFilters.get(table);

        //   const { rows, data } = tableDataCache.get(table);
        const headersCount = table.querySelectorAll("th").length;

        const rows = [...table.querySelectorAll("tbody tr")]
            .filter(row => row.children.length === headersCount);

        const data = rows.map(row =>
            [...row.children].map(cell => sg_getCellValue(cell))
        );

        const allRows = rows.filter((row, rowIndex) => {

            for (const colIndex in filters) {

                if (Number(colIndex) === col) continue;

                const filterObj = filters[colIndex];
                if (!filterObj) continue;

                const rawValue = data[rowIndex][colIndex];
                const cellValue = rawValue === "" ? "(Blank)" : rawValue;

                if (filterObj.values && !filterObj.values.includes(cellValue))
                    return false;

                if (filterObj.condition && rawValue !== "") {
                    // const num = parseFloat(rawValue);
                    const num = sg_parseNumber(rawValue);
                    const condVal = filterObj.condition.value;

                    switch (filterObj.condition.type) {
                        case "gt": if (!(num > condVal)) return false; break;
                        case "lt": if (!(num < condVal)) return false; break;
                        case "gte": if (!(num >= condVal)) return false; break;
                        case "lte": if (!(num <= condVal)) return false; break;
                        case "eq": if (!(num === condVal)) return false; break;
                    }
                }
            }

            return true;
        });

        const valueMap = new Map();

        allRows.forEach(r => {
            const raw = sg_getCellValue(r.children[col]);
            const key = raw.toLowerCase();
            if (!valueMap.has(key)) {
                valueMap.set(key, raw);
            }
        });

        const allValues = [...valueMap.values()]
            .sort((a, b) => {
                const numA = parseFloat(a);
                const numB = parseFloat(b);
                if (!isNaN(numA) && !isNaN(numB)) {
                    return numA - numB;
                }
                return a.localeCompare(b);
            });

        const showBlank = allValues.includes("");
        const nonBlankValues = allValues.filter(v => v !== "");

        // Get saved filter
        const filterObj = tableFilters.get(table)[col];
        const hasValueFilter = !!filterObj?.values;
        const saved = filterObj?.values || [];

        const selectAllText = popup.querySelector(".gs-select-all-text");
        const clearText = popup.querySelector(".gs-clear-text");

        function sg_updateSelectAllColor() {
            const allCheckboxes = [...container.querySelectorAll("input[type=checkbox]")];
            selectAllText.style.color = allCheckboxes.every(cb => cb.checked)
                ? "#007bff"
                : "#666";
        }

        // 1 If filter exists → show saved first
        if (hasValueFilter) {
            saved.forEach(v => {
                if (v !== "(Blank)" && allValues.includes(v)) {
                    const item = document.createElement("div");
                    item.className = "gs-value-item";
                    item.innerHTML = `<input type="checkbox" checked> <span>${v}</span>`;
                    container.appendChild(item);

                    item.addEventListener("click", e => {
                        if (e.target.tagName !== "INPUT")
                            item.querySelector("input").checked =
                                !item.querySelector("input").checked;
                        sg_updateSelectAllColor();
                    });
                }
            });
        }

        // 2 Show non-blank values
        nonBlankValues.forEach(v => {

            if (!saved.includes(v)) {

                // KEY FIX → initially check all
                const isChecked = hasValueFilter ? false : true;

                const item = document.createElement("div");
                item.className = "gs-value-item";
                item.innerHTML = `<input type="checkbox" ${isChecked ? "checked" : ""}> <span>${v}</span>`;
                container.appendChild(item);

                item.addEventListener("click", e => {
                    if (e.target.tagName !== "INPUT")
                        item.querySelector("input").checked =
                            !item.querySelector("input").checked;
                    sg_updateSelectAllColor();
                });
            }
        });

        // 3 Blank option
        if (showBlank) {

            const isChecked = hasValueFilter
                ? saved.includes("(Blank)")
                : true;  // initially checked

            const blankItem = document.createElement("div");
            blankItem.className = "gs-value-item";
            blankItem.innerHTML = `<input type="checkbox" ${isChecked ? "checked" : ""}> <span>(Blank)</span>`;
            container.appendChild(blankItem);

            blankItem.addEventListener("click", e => {
                if (e.target.tagName !== "INPUT")
                    blankItem.querySelector("input").checked =
                        !blankItem.querySelector("input").checked;
                sg_updateSelectAllColor();
            });
        }

        selectAllText.onclick = () => {

            const visibleItems = [...container.querySelectorAll(".gs-value-item")]
                .filter(div => div.style.display !== "none");

            visibleItems.forEach(div => {
                div.querySelector("input").checked = true;
            });

            sg_updateSelectAllColor();
        };

        clearText.onclick = () => {

            const visibleItems = [...container.querySelectorAll(".gs-value-item")]
                .filter(div => div.style.display !== "none");

            visibleItems.forEach(div => {
                div.querySelector("input").checked = false;
            });

            sg_updateSelectAllColor();
        };


        sg_updateSelectAllColor();

        // ===== Reset search =====
        popup.querySelector(".gs-search-box").value = "";

        // ===== LOAD CONDITION FOR THIS COLUMN =====
        const conditionSelect = popup.querySelector(".gs-condition-select");
        const conditionInput = popup.querySelector(".gs-condition-input");

        const condition = filterObj?.condition;

        if (condition) {
            conditionSelect.value = condition.type;
            conditionInput.style.display = "block";
            conditionInput.value = condition.value;
        } else {
            conditionSelect.value = "none";
            conditionInput.value = "";
            conditionInput.style.display = "none";
        }
    }

    function sg_toProperCase(str) {
        return str
            .toLowerCase()
            .split(" ")
            .filter(Boolean)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    function sg_parseNumber(value) {
        if (value === null || value === undefined) return NaN;

        return parseFloat(
            value
                .toString()
                .replace(/[^0-9.\-]/g, "") // remove ₹ , % etc.
        );
    }

    function sg_getCellValue(cell) {

        const numericSpan = cell.querySelector(".numeric-value");
        if (numericSpan) {
            return numericSpan.dataset.raw.trim();
        }

        const input = cell.querySelector("input");
        if (input) {
            return sg_toProperCase(input.value.trim());
        }

        return sg_toProperCase(cell.innerText.trim());
    }

    // ======= SEARCH =======
    popup.querySelector(".gs-search-box").addEventListener("input", () => {
        const text = popup.querySelector(".gs-search-box").value.toLowerCase();
        [...popup.querySelectorAll(".gs-value-item")].forEach(div => {
            div.style.display = div.textContent.toLowerCase().includes(text) ? "flex" : "none";
        });
    });

    popup.querySelector("#gs-ok-filter").addEventListener("click", () => {
        if (!activeTable) return;

        const container = popup.querySelector(".gs-values-box");
        const checkboxes = [...container.querySelectorAll("input[type=checkbox]")];
        const selectedValues = checkboxes
            .map(cb => cb.checked ? cb.parentElement.innerText.trim() : null)
            .filter(v => v !== null);

        const conditionType = conditionSelect.value;
        const conditionValue = conditionInput.value;

        const tableFilterObj = tableFilters.get(activeTable);

        // VALUE FILTER
        if (selectedValues.length === checkboxes.length) {
            delete tableFilterObj[activeColumn]?.values;
        } else {
            tableFilterObj[activeColumn] = tableFilterObj[activeColumn] || {};
            tableFilterObj[activeColumn].values = selectedValues;
        }

        // CONDITION FILTER
        if (conditionType !== "none" && conditionValue !== "") {
            tableFilterObj[activeColumn] = tableFilterObj[activeColumn] || {};
            tableFilterObj[activeColumn].condition = {
                type: conditionType,
                value: parseFloat(conditionValue)
            };
        } else {
            if (tableFilterObj[activeColumn])
                delete tableFilterObj[activeColumn].condition;
        }

        sg_applyFilters(activeTable);
        sg_styleFilterIcons(activeTable);
        popup.style.display = "none";
    });

    popup.querySelector("#gs-cancel-filter").addEventListener("click", () => { popup.style.display = "none"; });

    // ======= SORT =======
    popup.querySelectorAll("[data-sort]").forEach(btn => {
        btn.addEventListener("click", () => {
            if (!activeTable) return;
            const col = activeColumn;
            const dir = btn.dataset.sort;
            const table = activeTable;
            const rows = [...table.querySelectorAll("tbody tr")].filter(r => r.style.display !== "none");

            rows.sort((a, b) => {

                const Araw = sg_getCellValue(a.children[col]);
                const Braw = sg_getCellValue(b.children[col]);

                // const Anum = parseFloat(Araw);
                // const Bnum = parseFloat(Braw);
                const Anum = sg_parseNumber(Araw);
                const Bnum = sg_parseNumber(Braw);

                const isNumeric = !isNaN(Anum) && !isNaN(Bnum);

                if (isNumeric) {
                    return dir === "asc"
                        ? Anum - Bnum
                        : Bnum - Anum;
                }

                return dir === "asc"
                    ? Araw.localeCompare(Braw)
                    : Braw.localeCompare(Araw);
            });

            const tbody = table.querySelector("tbody");
            rows.forEach(r => tbody.appendChild(r));
        });
    });

    // ======= APPLY FILTER FUNCTION =======

    function sg_applyFilters(table) {

        const filters = tableFilters.get(table);
        const headersCount = table.querySelectorAll("th").length;

        const rows = [...table.querySelectorAll("tbody tr")]
            .filter(row => row.children.length === headersCount);

        const data = rows.map(row =>
            [...row.children].map(cell => sg_getCellValue(cell))
        );

        for (let i = 0; i < rows.length; i++) {

            let show = true;

            for (const col in filters) {

                const filterObj = filters[col];
                if (!filterObj) continue;

                const rawValue = data[i][col];
                const cellValue = rawValue === "" ? "(Blank)" : rawValue;

                // VALUE FILTER
                if (filterObj.values && !filterObj.values.includes(cellValue)) {
                    show = false;
                    break;
                }

                // CONDITION FILTER
                if (filterObj.condition && rawValue !== "") {
                    // const num = parseFloat(rawValue);
                    const num = sg_parseNumber(rawValue);
                    const condVal = filterObj.condition.value;

                    switch (filterObj.condition.type) {
                        case "gt": if (!(num > condVal)) show = false; break;
                        case "lt": if (!(num < condVal)) show = false; break;
                        case "gte": if (!(num >= condVal)) show = false; break;
                        case "lte": if (!(num <= condVal)) show = false; break;
                        case "eq": if (!(num === condVal)) show = false; break;
                    }

                    if (!show) break;
                }
            }

            rows[i].style.display = show ? "" : "none";
        }
        sg_makeCellsFocusable(table);
    }

    // ======= STYLE FILTER ICONS =======
    function sg_styleFilterIcons(table) {
        const filters = tableFilters.get(table);

        table.querySelectorAll("th .filter-icon").forEach((icon, i) => {
            const filterObj = filters[i];

            const isActive =
                filterObj &&
                (
                    (filterObj.values && filterObj.values.length > 0) ||
                    filterObj.condition
                );

            icon.classList.toggle("gs-filter-active", !!isActive);
        });
    }



    // ======= CLOSE POPUP =======
    document.addEventListener("click", e => {
        if (!popup.contains(e.target)) popup.style.display = "none";
    });

    function sg_makeCellsFocusable(table) {
        table.querySelectorAll("tbody td").forEach(td => {
            td.setAttribute("tabindex", "0");
        });
    }

    // ======= KEYBOARD NAVIGATION =======
    document.querySelectorAll(".data-table td").forEach(td => td.setAttribute("tabindex", "0"));

    document.addEventListener("keydown", e => {
        const cell = document.activeElement;

        if (!cell || cell.tagName !== "TD") return;

        const row = cell.parentElement;
        const table = row.closest("table");

        if (!table || !table.classList.contains("data-table")) return;

        const rows = [...table.querySelectorAll("tbody tr")]
            .filter(r => r.style.display !== "none");

        const rowIndex = rows.indexOf(row);
        const colIndex = [...row.children].indexOf(cell);

        let newRow = rowIndex;
        let newCol = colIndex;

        const ctrl = e.ctrlKey;

        switch (e.key) {
            case "ArrowDown":
                newRow = ctrl ? rows.length - 1 : Math.min(rowIndex + 1, rows.length - 1);
                break;

            case "ArrowUp":
                newRow = ctrl ? 0 : Math.max(rowIndex - 1, 0);
                break;

            case "ArrowRight":
                newCol = ctrl ? row.children.length - 1 : Math.min(colIndex + 1, row.children.length - 1);
                break;

            case "ArrowLeft":
                newCol = ctrl ? 0 : Math.max(colIndex - 1, 0);
                break;

            default:
                return;
        }

        e.preventDefault();

        const targetRow = rows[newRow];
        const targetCell = targetRow?.children[newCol];

        if (targetCell) {
            targetCell.focus();
        }
    });

    // ===== AUTO INIT FOR DYNAMIC TABLES =====

    let sgObserverTimeout;

    const observer = new MutationObserver(() => {

        clearTimeout(sgObserverTimeout);

        sgObserverTimeout = setTimeout(() => {

            document.querySelectorAll(".data-table").forEach(table => {

                // Prevent re-initialization
                if (table.dataset.sgFilterInit === "true") return;

                sg_initTableFilters(table);
                sg_makeCellsFocusable(table);

            });

        }, 100); // debounce delay

    });

    observer.observe(document.body, { childList: true, subtree: true });

})();
