// =====================
// BARCODE PRINTING (POST)
// Exposes: printBarcode(id, action)
// Also registers POST /printBarcode when required by the app
// And allows running from the terminal for quick tests: node barcode.js <id> <action>
// =====================
const { execFile } = require('child_process');
const path = require('path');

// don't require project HTTP helpers when running from CLI (they pull express)
// We'll only load them when this file is required by the server (require.main !== module)
let routes;

const PRINTER_NAME = process.env.BARCODE_PRINTER_NAME || 'ZDesigner ZD411-203dpi ZPL';
const PYTHON_CMD = process.env.PYTHON_CMD || 'python';

function printBarcode(id, action) {
	return new Promise((resolve, reject) => {
		if (!id || !action) return reject(new Error('Missing parameters'));
	const allowed = ['takeout', 'return'];
	if (!allowed.includes(action)) return reject(new Error("Invalid action, allowed: 'takeout'|'return'"));

	const prefix = action === 'return' ? 'RKTM_' : 'KTM_';
	const barcodeValue = `${prefix}${id}`;

	const pythonScript = path.join(__dirname, 'send_zebra_usb.py');

		execFile(PYTHON_CMD, [pythonScript, PRINTER_NAME, barcodeValue], (error, stdout, stderr) => {
			if (error) return reject(new Error(stderr || error.message));
			resolve((stdout || '').toString().trim());
		});
	});
}
// If this module is required by the server, register the Express route.
// If run directly from the CLI (node barcode.js ...) we skip loading `util.js` to avoid
// pulling in Express and other server-only dependencies.
if (require.main !== module) {
	routes = require('./util.js');
	// Express route to call from web client / API
	routes.router.post('/printBarcode', routes.checkAuthenticated, async (req, res) => {
		const { id, action } = req.body || {};
		if (!id || !action) {
			return res.status(400).json({
				success: false,
				error: "Missing body. Required: { id: number, action: 'takeout'|'return' }"
			});
		}
		try {
			const result = await printBarcode(id, action);
			return res.json({ success: true, message: 'Barcode printed successfully.', printerOutput: result });
		} catch (err) {
			console.error('printBarcode error:', err);
			return res.status(500).json({ success: false, error: String(err) });
		}
	});
}
// Export function for programmatic use and testing
module.exports = { printBarcode };

// If run directly, allow terminal invocation: node barcode.js <id> <takeout|return>
if (require.main === module) {
	(async () => {
		const [, , id, action] = process.argv;
		if (!id || !action) {
			console.error('Usage: node barcode.js <id> <takeout|return>');
			process.exit(2);
		}

		try {
			const out = await printBarcode(id, action);
			console.log('OK:', out);
			process.exit(0);
		} catch (err) {
			console.error('ERROR:', err.toString());
			process.exit(1);
		}
	})();
}
