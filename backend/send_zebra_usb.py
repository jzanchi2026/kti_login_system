import sys
import win32print

def send_zpl_to_usb(printer_name, zpl):
    """Send raw ZPL to a USB printer on Windows"""
    hPrinter = win32print.OpenPrinter(printer_name)
    try:
        hJob = win32print.StartDocPrinter(hPrinter, 1, ("ZPL Print Job", None, "RAW"))
        win32print.StartPagePrinter(hPrinter)
        win32print.WritePrinter(hPrinter, zpl.encode('utf-8'))
        win32print.EndPagePrinter(hPrinter)
        win32print.EndDocPrinter(hPrinter)
    finally:
        win32print.ClosePrinter(hPrinter)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python send_zebra_usb.py <PRINTER_NAME> <BARCODE>")
        sys.exit(1)

    printer_name = sys.argv[1]
    barcode_value = sys.argv[2]

    # Label and barcode sizing (dots)
    label_width = 406  # ^PW value (print width in dots)
    label_length = 102  # ^LL value (label length in dots)

    module_width = 2  # ^BY module width (dots)
    barcode_height = 80  # height used in ^BC

    # Estimate Code128 barcode width in modules: roughly 11 modules per data char plus ~35 modules for start/stop/check
    # This is an approximation but works reliably for centering typical lengths.
    data_len = len(barcode_value)
    modules = 11 * data_len + 35
    barcode_pixel_width = modules * module_width

    # Compute X origin so barcode is centered horizontally within label width
    x_origin = max(0, int((label_width - barcode_pixel_width) / 2))

    # Compute Y origin so barcode is centered vertically within label length
    y_origin = max(0, int((label_length - barcode_height) / 2))

    # Generate ZPL for the barcode using computed origins
    zpl = f"""
^XA
^PW{label_width}
^LL{label_length}
^FO{x_origin},{y_origin}
^BY{module_width}
^BCN,{barcode_height},Y,N,N
^FD{barcode_value}^FS
^XZ
"""
    send_zpl_to_usb(printer_name, zpl)
    print(f" Sent {barcode_value} to printer {printer_name}")
