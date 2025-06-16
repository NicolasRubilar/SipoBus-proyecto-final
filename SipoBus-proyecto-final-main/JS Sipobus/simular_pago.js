const { jsPDF } = window.jspdf;

function generarPDF() {
  const resumen = JSON.parse(localStorage.getItem('resumenCompra')) || {};
  const asientos = resumen.asientos || [];
  const comida = resumen.comida;
  const total = resumen.total || '0';
  const logoUrl = '../imagenes_sipobus/logo_sipobus.png';

  // Cargar logo como base64 y luego generar PDF
  const img = new window.Image();
  img.src = logoUrl;
  img.onload = function() {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const logoBase64 = canvas.toDataURL('image/png');

    const doc = new jsPDF('landscape', 'mm', 'A5');
    asientos.forEach((a, idx) => {
      if (idx > 0) doc.addPage();
      const margin = 10;
      let y = margin + 10;
      // Bordes tipo ticket
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, margin, 190, 90, 5, 5);
      // Logo
      doc.addImage(logoBase64, 'PNG', margin + 5, y - 8, 30, 18);
      // Título
      doc.setFontSize(18);
      doc.setTextColor(0, 102, 204);
      doc.text('SipoBus - Boleto de Viaje', margin + 40, y);
      y += 14;
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Origen: ${resumen.origen || 'N/A'}`, margin + 5, y);
      doc.text(`Destino: ${resumen.destino || 'N/A'}`, 100, y);
      y += 8;
      doc.text(`Fecha: ${resumen.fecha || 'N/A'}`, margin + 5, y);
      doc.text(`Hora: ${resumen.hora || 'N/A'}`, 100, y);
      y += 8;
      // Línea divisoria
      doc.setDrawColor(200);
      doc.line(margin + 2, y, 195, y);
      y += 8;
      // Sección de asientos
      doc.setFontSize(13);
      doc.text('Asiento:', margin + 5, y);
      y += 6;
      doc.setFontSize(11);
      doc.text(`• ${a.id} (${a.tipo.replace('-', ' ')})`, margin + 10, y);
      y += 8;
      // Comida
      doc.setFontSize(12);
      doc.text(`Comida incluida: ${comida ? 'Sí' : 'No'}`, margin + 5, y);
      y += 8;
      // Total
      doc.setFontSize(14);
      doc.setTextColor(34, 139, 34);
      doc.text(`TOTAL PAGADO: ${total}`, margin + 5, y);
      y += 10;
      // Pie
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text('Gracias por preferir SipoBus - www.sipobus.cl', margin + 5, y);
    });
    doc.save('boleto_sipobus.pdf');
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const btnPDF = document.getElementById("btnDescargarPDF");
  const btnOtra = document.getElementById("btnOtraCompra");
  const btnInicio = document.getElementById("btnVolverInicio");

  btnPDF.onclick = function () {
    const resumen = JSON.parse(localStorage.getItem("resumenCompra"));
    if (!resumen) {
      alert("No hay datos de compra para el ticket.");
      return;
    }
    generarPDF();
  };

  btnOtra.onclick = function () {
    window.location.href = "seleccion_asiento_y_comida.html";
  };
  btnInicio.onclick = function () {
    window.location.href = "inicio.html";
  };
});