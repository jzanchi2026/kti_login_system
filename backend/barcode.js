const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const PRINTER_PORT = '\\\\.\\USB001'; // Direct access to USB printer port (Zebra ZD411)
const PRINTER_NAME = 'ZDesigner ZD411-203dpi ZPL'; // Just for logs

function printBarcode(id, action) {
  return new Promise((resolve, reject) => {
    if (!id || !action) return reject('Missing parameters');

    const prefix = action === 'return' ? 'RKTM_' : 'KTM_';
    const barcodeValue = `${prefix}${id}`;

    const pythonScript = path.join(__dirname, 'generate_zebra_barcode.py');

    // Run Python script to generate ZPL
    execFile('python', [pythonScript, barcodeValue], (error, stdout, stderr) => {
      if (error) return reject(`Python error: ${stderr || error.message}`);

      const zpl = stdout.trim();
      if (!zpl) return reject('No ZPL data generated.');

      try {
        // Send raw ZPL directly to the printer port
        const handle = fs.openSync(PRINTER_PORT, 'w'); // open USB001 for writing
        fs.writeSync(handle, zpl);
        fs.closeSync(handle);

        resolve(`✅ Sent barcode ${barcodeValue} to ${PRINTER_NAME} via ${PRINTER_PORT}`);
      } catch (err) {
        reject(`❌ Failed to send to printer: ${err.message}`);
      }
    });
  });
}

// Allow standalone testing
if (require.main === module) {
  const testId = process.argv[2] || '42';
  const testAction = process.argv[3] || 'takeout';
  printBarcode(testId, testAction)
    .then(msg => console.log(msg))
    .catch(err => console.error('Error:', err));
}
can
module.exports = { printBarcode };
