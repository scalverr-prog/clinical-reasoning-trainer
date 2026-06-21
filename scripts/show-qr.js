import QRCode from 'qrcode';

const appUrl = 'https://clinical-reasoning-trainer-one.vercel.app';

// Generate QR code as terminal output
QRCode.toString(appUrl, { type: 'terminal', small: true }, (err, qr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log('\n');
  console.log('  ClinicalPro - Scan to open the app');
  console.log('  ' + appUrl);
  console.log('\n');
  console.log(qr);
});
