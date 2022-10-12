var insight_data = {};
var headers = [];
var rows = [];
var insight_config = {};
insight_config['filters'] = {};
insight_config['filters']['master'] = '';
insight_config['filters']['cols'] = [];

insight_config['table'] = {};
insight_config['table']['display'] = true;
insight_config['table']['paging_size'] = 25;
insight_config['table']['sort'] = [0, 'asc'];

insight_config['pivot'] = {};
insight_config['pivot']['display'] = true;
insight_config['pivot']['rows'] = [];
insight_config['pivot']['cols'] = [];
insight_config['pivot']['sort_row'] = ['key', 'asc']; // key, value
insight_config['pivot']['sort_col'] = ['key', 'asc']; // key, value

function render_pivot() {

	// Variables
	let pivot_rows = insight_config['pivot']['rows'];
	let pivot_cols = insight_config['pivot']['cols'];

	let sort_col = insight_config['pivot']['sort_col'][0];
	let sort_col_order = insight_config['pivot']['sort_col'][1];
	let sort_row = insight_config['pivot']['sort_row'][0];
	let sort_row_order = insight_config['pivot']['sort_row'][1];
	
	let grand_total = rows.length;
	let html = '';

	if (pivot_rows.length == 0 && pivot_cols.length == 0) // Nothing selected
	{
		html = '<tfoot><tr><th>Totals</th><td>' + grand_total + '</td></tr></tfoot>'
		document.getElementById("insight_pivot").innerHTML = html;
	}
	else if (pivot_rows.length > 0 && pivot_cols.length == 0) // Rows selected
	{
		let keys_rows = {}; let totals_rows = [];
		for (let i = 0; i < rows.length; i++)
		{
			let key_array = []; for (let i2 = 0; i2 < pivot_rows.length; i2++) { key_array.push(rows[i][pivot_rows[i2]]); }
			let key = key_array.join('|'); if (keys_rows[key]) { keys_rows[key] += 1; } else { keys_rows[key] = 1; }
		}
		for (const [key, value] of Object.entries(keys_rows)) { totals_rows.push({key: key, value: value}) }
		// console.log(totals_rows); // console.log(keys_rows); 

		// Sorting
		if (sort_col_order == "asc") { totals_rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) > Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] > b[sort_col] ? 1 : -1; } }); }
		if (sort_col_order == "desc") { totals_rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) < Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] < b[sort_col] ? 1 : -1; } }); }

		// Render
		html += '<thead><tr><th>' + pivot_rows.join('</th><th>') + '</th><th class="label_col_totals">Totals</th></tr></thead>'
		html += '<tbody>';
		for (let i = 0; i < totals_rows.length; i++) { html += '<tr><th class="label_row">' + totals_rows[i]['key'].split('|').join('</th><th class="label_row">') + '</th><td>' + totals_rows[i]['value'] + '</td></tr>'; }
		html += '</tbody>';
		html += '<tfoot><tr><th class="label_row_totals" colspan=' + pivot_rows.length + '>Totals</th><td>' + grand_total + '</td></tr></tfoot>'
		document.getElementById("insight_pivot").innerHTML = html;
	}
	else if (pivot_rows.length == 0 && pivot_cols.length > 0) // Cols selected
	{
		let keys_cols = {}; let totals_cols = [];
		for (let i = 0; i < rows.length; i++)
		{
			let key_array = []; for (let i2 = 0; i2 < pivot_cols.length; i2++) { key_array.push(rows[i][pivot_cols[i2]]); }
			let key = key_array.join('|'); if (keys_cols[key]) { keys_cols[key] += 1; } else { keys_cols[key] = 1; }
		}
		for (const [key, value] of Object.entries(keys_cols)) { totals_cols.push({key: key, value: value}) }
		// console.log(totals_cols); console.log(keys_cols);

		// Sorting
		if (sort_row_order == "asc") { totals_cols.sort(function(a,b) { if (!isNaN(a[sort_row]) && !isNaN(b[sort_row])) { return Number(a[sort_row]) > Number(b[sort_row]) ? 1 : -1; } else { return a[sort_row] > b[sort_row] ? 1 : -1; } }); }
		if (sort_row_order == "desc") { totals_cols.sort(function(a,b) { if (!isNaN(a[sort_row]) && !isNaN(b[sort_row])) { return Number(a[sort_row]) < Number(b[sort_row]) ? 1 : -1; } else { return a[sort_row] < b[sort_row] ? 1 : -1; } }); }

		// Render
		html += '<thead>'
		for (let i = 0; i < pivot_cols.length; i++)
		{
			html += '<tr>'
			html += '<th>' + pivot_cols[i] + '</th>'
			for (let i2 = 0; i2 < totals_cols.length; i2++) { html += '<th>' + totals_cols[i2]['key'].split('|')[i] + '</th>' }
			if (i == 0) { html += '<th rowspan="' + pivot_cols.length + '">Totals</th>' }
			html += '</tr>'
		}
		html += '</thead>'
		html += '<tfoot><tr>';
		html += '<th class="label_row_totals">Totals</th>'
		for (let i = 0; i < totals_cols.length; i++) { html += '<td>' + totals_cols[i]['value'] + '</td>'; }
		html += '<th>' + grand_total + '</th>'
		html += '</tr></tfoot>';
		document.getElementById("insight_pivot").innerHTML = html;
	}
	else // Rows & Cols selected
	{
		// Rows
		let keys_rows = {}; let totals_rows = [];
		let keys_cols = {}; let totals_cols = [];
		let matrix = {}; let pivot_matrix = pivot_rows.concat(pivot_cols);
		for (let i = 0; i < rows.length; i++)
		{
			let key_array;
			let key;

			// Rows
			key_array = []; for (let i2 = 0; i2 < pivot_rows.length; i2++) { key_array.push(rows[i][pivot_rows[i2]]); }
			key = key_array.join('|'); if (keys_rows[key]) { keys_rows[key] += 1; } else { keys_rows[key] = 1; }

			// Cols
			key_array = []; for (let i2 = 0; i2 < pivot_cols.length; i2++) { key_array.push(rows[i][pivot_cols[i2]]); }
			key = key_array.join('|'); if (keys_cols[key]) { keys_cols[key] += 1; } else { keys_cols[key] = 1; }

			// Data Matrix
			key_array = []; for (let i2 = 0; i2 < pivot_matrix.length; i2++) { key_array.push(rows[i][pivot_matrix[i2]]); }
			key = key_array.join('|'); if (matrix[key]) { matrix[key] += 1; } else { matrix[key] = 1; }
		}
		for (const [key, value] of Object.entries(keys_rows)) { totals_rows.push({key: key, value: value}) }
		for (const [key, value] of Object.entries(keys_cols)) { totals_cols.push({key: key, value: value}) }
		// console.log(totals_rows); // console.log(keys_rows);
		// console.log(totals_cols); // console.log(keys_cols);
		// console.log(matrix);

		// Sorting
		if (sort_col_order == "asc") { totals_rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) > Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] > b[sort_col] ? 1 : -1; } }); }
		if (sort_col_order == "desc") { totals_rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) < Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] < b[sort_col] ? 1 : -1; } }); }
		if (sort_row_order == "asc") { totals_cols.sort(function(a,b) { if (!isNaN(a[sort_row]) && !isNaN(b[sort_row])) { return Number(a[sort_row]) > Number(b[sort_row]) ? 1 : -1; } else { return a[sort_row] > b[sort_row] ? 1 : -1; } }); }
		if (sort_row_order == "desc") { totals_cols.sort(function(a,b) { if (!isNaN(a[sort_row]) && !isNaN(b[sort_row])) { return Number(a[sort_row]) < Number(b[sort_row]) ? 1 : -1; } else { return a[sort_row] < b[sort_row] ? 1 : -1; } }); }

		// Render
		html += '<thead>'
		for (let i = 0; i < pivot_cols.length; i++)
		{
			html += '<tr>'
			html += '<th colspan=' + pivot_rows.length + '>' + pivot_cols[i] + '</th>'
			for (let i2 = 0; i2 < totals_cols.length; i2++) { html += '<th>' + totals_cols[i2]['key'].split('|')[i] + '</th>' }
			if (i == 0) { html += '<th class="label_col_totals" rowspan="' + pivot_cols.length + '">Totals</th>' }
			html += '</tr>'
		}
		html += '</thead>'
		html += '<tbody>';
		for (let i = 0; i < totals_rows.length; i++)
		{
			html += '<tr>';
			html += '<th class="label_row">' + totals_rows[i]['key'].split('|').join('</th class="label_row"><th>') + '</th>';
			for (let i2 = 0; i2 < totals_cols.length; i2++)
			{
				let matrix_key = totals_rows[i]['key'] + '|' + totals_cols[i2]['key'];
				let cell_value = ''; if (matrix[matrix_key]) { cell_value = matrix[matrix_key]; }
				html += '<td data-key-row="' + totals_rows[i]['key'] + '" data-key-col="' + totals_cols[i2]['key'] + '">' + cell_value + '</td>';
			}
			html += '<th>' + totals_rows[i]['value'] + '</th>';
			html += '</tr>';
		}
		html += '</tbody>';
		html += '<tfoot><tr>';
		html += '<th class="label_row_totals" colspan=' + pivot_rows.length + '>Totals</th>'
		for (let i = 0; i < totals_cols.length; i++) { html += '<td>' + totals_cols[i]['value'] + '</td>'; }
		html += '<th>' + grand_total + '</th>'
		html += '</tr></tfoot>';
		document.getElementById("insight_pivot").innerHTML = html;
	}
}

function render_table() {

	// Variables
	let sort_col = insight_config['table']['sort'][0];
	let sort_order = insight_config['table']['sort'][1];

	// Sorting
	if (sort_order == 'asc') { rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) > Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] > b[sort_col] ? 1 : -1; }}); }
	if (sort_order == 'desc') { rows.sort(function(a,b) { if (!isNaN(a[sort_col]) && !isNaN(b[sort_col])) { return Number(a[sort_col]) < Number(b[sort_col]) ? 1 : -1; } else { return a[sort_col] < b[sort_col] ? 1 : -1; }}); }

	// Rendering
	let html = "";
	if (rows.length > 0) {
		for (let i = 0; i < rows.length; i++)
		{
			if (i < insight_config['table']['paging_size'])
			{
				html += "<tr><td>" + rows[i].join("</td><td>") + "</td></tr>";
			}
		}
	}
	else { html = '<tr><td colspan="' + insight_data['headers'].length + '">No results</td></tr>' }
	document.getElementById("insight_table_body").innerHTML = html;
}

function render() {

	// Variables
	filters_master = insight_config['filters']['master'];
	headers = insight_data['headers'];
	rows = [];

	// Filters
	if (filters_master != "") { for (let i = 0; i < insight_data['rows'].length; i++) { if (insight_data['rows'][i].join().toLowerCase().includes(filters_master)) { rows.push(insight_data['rows'][i]); } } }
	else { rows = insight_data['rows']; }

	// console.log(insight_config);
	setTimeout(function() {
		render_pivot();
		render_table();
	}, 50);

}

function load(div, url) {
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", url, true); xhttp.send();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			// console.log(this.responseText);
			let data = this.responseText;
			let input = data.toString().split("\n");
			insight_data['headers'] = input.shift().split("|");
			insight_data['rows'] = []; for (let i = 0; i < input.length; i++) { insight_data['rows'][i] = input[i].split("|"); }

			// Render Skeleton
			let html = '';
			document.getElementById(div).innerHTML = `
			<div id="insight_settings" style="float: left;">
				<div id="insight_filter_settings">
					<input id="insight_master_search" placeholder="Search.."></input><br>
				</div>
				<div id="insight_pivot_settings">
					<label>Rows:</label><br><select id="insight_pivot_settings_rows" class="insight_select_multiple" size="8" multiple></select><br>
					<label>Cols:</label><br><select id="insight_pivot_settings_cols" class="insight_select_multiple" size="8" multiple></select><br>
				</div>
				<div id="insight_table_settings">
				</div>
			</div>
			<div id="insight_pivot_container"><table id="insight_pivot"></table></div>
			<div id="insight_table_container"><table id="insight_table"></table></div>
			`;

			// Load pivot
			html = ''; for (let i = 0; i < insight_data['headers'].length; i++) { html += '<option value="' + i + '">' + insight_data['headers'][i] + '</option>'; }
			document.getElementById("insight_pivot_settings_rows").innerHTML = html;
			document.getElementById("insight_pivot_settings_cols").innerHTML = html;

			document.getElementById("insight_pivot_settings_rows").onchange = function() {
				let pivot_rows = []; for (let i = 0; i < this.selectedOptions.length; i++) { pivot_rows.push(this.selectedOptions[i].value); }
				insight_config['pivot']['rows'] = pivot_rows; render();
			};
			document.getElementById("insight_pivot_settings_cols").onchange = function() {
				let pivot_cols = []; for (let i = 0; i < this.selectedOptions.length; i++) { pivot_cols.push(this.selectedOptions[i].value); }
				insight_config['pivot']['cols'] = pivot_cols; render();
			};

			// Load table
			html = '';
			html += "<thead><tr>";
			for (let i = 0; i < insight_data['headers'].length; i++)
			{
				if (insight_config['table']['sort'][0] == i) { html += '<th class="insight_icon_' + insight_config['table']['sort'][1] + '">' + insight_data['headers'][i] + '</th>'; }
				else { html += '<th>' + insight_data['headers'][i] + '</th>'; }
			}
			html += "</tr></thead>";
			html += '<tbody id="insight_table_body"></tbody>';
			document.getElementById("insight_table").innerHTML = html;

			// Initial results render
			render();

			// Search box
			document.getElementById("insight_master_search").onkeyup = function() {
				insight_config['filters']['master'] = document.getElementById("insight_master_search").value.toLowerCase();
				render();
			};

		}
	};
}