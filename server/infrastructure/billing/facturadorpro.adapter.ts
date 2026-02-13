import { IBillingGateway, InvoicePayload, BillingResponse } from "@/server/domain/interfaces/billing.gateway";

export class FacturadorProAdapter implements IBillingGateway {

    async emitInvoice(data: InvoicePayload, apiUrl: string, token: string): Promise<BillingResponse> {

        // Mapeamos tu Objeto de Dominio al JSON "Ganador" de Facturador Pro
        const requestBody = {
            "serie_documento": data.series,
            "numero_documento": "#", // # hace que sea autoincremental
            "fecha_de_emision": data.issueDate,
            "hora_de_emision": new Date().toLocaleTimeString('es-PE', { hour12: false }),

            // --- CAMPOS CRÍTICOS QUE HICIERON FUNCIONAR EL CURL ---
            "codigo_tipo_documento": "01",
            "codigo_tipo_moneda": "PEN",
            "codigo_tipo_operacion": "0101",
            "codigo_condicion_de_pago": "01",
            "fecha_vencimiento": data.dueDate,
            "fecha_de_vencimiento": data.dueDate, // Enviamos ambos por seguridad
            "date_of_due": data.dueDate,          // Enviamos directo a DB por seguridad
            // ------------------------------------------------------

            "datos_del_cliente_o_receptor": {
                "codigo_tipo_documento_identidad": data.client.docType,
                "numero_documento": data.client.docNumber,
                "apellidos_y_nombres_o_razon_social": data.client.name,
                "codigo_pais": "PE",
                "ubigeo": "150101", // Puedes parametrizarlo luego
                "direccion": data.client.address,
                "correo_electronico": data.client.email,
                "telefono": ""
            },
            "totales": {
                "total_exportacion": 0.00,
                "total_operaciones_gravadas": data.amounts.totalOpGravadas,
                "total_operaciones_inafectas": 0.00,
                "total_operaciones_exoneradas": 0.00,
                "total_igv": data.amounts.totalIgv,
                "total_impuestos": data.amounts.totalIgv,
                "total_valor": data.amounts.totalOpGravadas,
                "total_venta": data.amounts.total
            },
            "items": data.items.map(item => ({
                "codigo_interno": item.internalId,
                "descripcion": item.description,
                "codigo_producto_sunat": "",
                "unidad_de_medida": "NIU",
                "cantidad": item.quantity,
                "valor_unitario": item.unitValue,
                "codigo_tipo_precio": "01",
                "precio_unitario": item.price,
                "codigo_tipo_afectacion_igv": "10", // Gravado - Operación Onerosa
                "total_base_igv": item.unitValue * item.quantity,
                "porcentaje_igv": 18.00,
                "total_igv": (item.price - item.unitValue) * item.quantity,
                "total_impuestos": (item.price - item.unitValue) * item.quantity,
                "total_valor_item": item.unitValue * item.quantity,
                "total_item": item.price * item.quantity
            }))
        };

        try {
            const response = await fetch(`${apiUrl}/documents`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (!result.success) {
                console.error("Error Facturador:", result.message);
                return {
                    success: false,
                    message: result.message || "Error desconocido al facturar"
                };
            }

            return {
                success: true,
                externalId: result.data.external_id,
                pdfUrl: result.links.pdf,
                xmlUrl: result.links.xml,
                message: "Factura emitida correctamente"
            };

        } catch (error) {
            console.error("Error de conexión con Facturador:", error);
            return { success: false, message: "Error de conexión con el servicio de facturación" };
        }
    }
}