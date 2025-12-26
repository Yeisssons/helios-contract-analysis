# 📋 Guía de Testing de Contratos - Helios Contract Analysis

## Resumen

Se han creado **12 contratos de muestra** en PDF, uno para cada sector de la aplicación. Cada contrato está diseñado para probar diferentes puntos de extracción y casos de uso.

---

## Contratos Disponibles

### 1. FINANCIERO - Préstamo Personal

**Archivo:** `01-FINANCIERO-Prestamo-Personal.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Partes | Banco Helios Capital / María García Fernández |
| Importe | 25.000,00 € |
| Tipo interés | 7,50% TIN / 8,12% TAE |
| Duración | 60 meses |
| Fecha inicio | 1 de febrero de 2025 |
| Fecha fin | 31 de enero de 2030 |
| Cuota mensual | 500,57 € |
| Comisión apertura | 1,50% (375 €) |
| Interés demora | 9,50% |
| Penalizaciones | 2% adicional por impago |
| Preaviso resolución | 30 días |

---

### 2. INMOBILIARIO - Arrendamiento de Vivienda

**Archivo:** `02-INMOBILIARIO-Arrendamiento-Vivienda.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Arrendador | Antonio Rodríguez Sánchez (DNI 45678912B) |
| Arrendatario | Elena Martínez Ruiz (DNI 78912345C) |
| Dirección inmueble | Calle Velázquez 85, 3º Izq, 28006 Madrid |
| Renta mensual | 1.200,00 € |
| Duración | 5 años |
| Fecha inicio | 1 de marzo de 2025 |
| Fecha fin | 28 de febrero de 2030 |
| Fianza | 2.400,00 € (2 mensualidades) |
| Referencia catastral | 9872023VK4897S0001WX |
| Preaviso | 30 días (arrendatario) / 4 meses (arrendador) |

---

### 3. TECNOLOGÍA - Desarrollo de Software

**Archivo:** `03-TECNOLOGIA-Desarrollo-Software.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Proveedor | Helios Tech Solutions, S.L. |
| Cliente | Innovaciones Digitales Corp, S.A. |
| Proyecto | CRM-ENTERPRISE-2025 / InnovaCRM Enterprise |
| Precio total | 150.000,00 € + IVA |
| Duración | 8 meses |
| Fecha inicio | 1 de febrero de 2025 |
| Fecha entrega | 30 de septiembre de 2025 |
| Penalización retraso | 0,5% por semana (máx 10%) |
| Garantía | 12 meses |
| SLA disponibilidad | 99.9% |
| Preaviso resolución | 30 días |

---

### 4. SALUD - Servicios Sanitarios

**Archivo:** `04-SALUD-Servicios-Sanitarios.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Prestador | Grupo Sanitario Helios Salud, S.A. |
| Contratante | Corporación Industrial Española, S.A. |
| Empleados cubiertos | 450 trabajadores |
| Prima mensual/empleado | 65,00 € |
| Coste anual estimado | 450.000 € |
| Duración | 2 años |
| Fecha inicio | 1 de febrero de 2025 |
| Fecha fin | 31 de enero de 2027 |
| Carencia cirugía | 6 meses |
| Preaviso resolución | 60 días |

---

### 5. CONSTRUCCIÓN - Ejecución de Obra

**Archivo:** `05-CONSTRUCCION-Ejecucion-Obra.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Contratista | Constructora Helios Edificaciones, S.A. |
| Promotor | Desarrollo Urbanístico Castellana, S.L. |
| Obra | Residencial "Jardines de Valdebebas" - Fase II |
| Precio | 8.500.000,00 € |
| Plazo ejecución | 24 meses |
| Fecha inicio | 1 de marzo de 2025 |
| Fecha fin | 28 de febrero de 2027 |
| Penalización retraso | 5.000 €/día (máx 10%) |
| Garantía estructura | 10 años |
| Retención garantía | 5% |
| Preaviso resolución | 90 días |

---

### 6. LABORAL (HR) - Contrato de Trabajo

**Archivo:** `06-LABORAL-Contrato-Trabajo.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Empresa | Helios Consulting Group, S.L. |
| Trabajador | Lucía Hernández Moreno (DNI 56789012D) |
| Puesto | Senior Consultant |
| Salario bruto anual | 52.000,00 € |
| Pagas | 14 pagas |
| Jornada | 40 horas semanales |
| Período prueba | 6 meses |
| Fecha inicio | 1 de febrero de 2025 |
| Vacaciones | 23 días laborables |
| No competencia | 12 meses post-contractual |
| Preaviso dimisión | 30 días |

---

### 7. SEGUROS - Póliza Multirriesgo

**Archivo:** `07-SEGUROS-Poliza-Multirriesgo.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Aseguradora | Helios Seguros y Reaseguros, S.A. |
| Tomador | Distribuciones Comerciales del Norte, S.L. |
| Nº póliza | MRE-2025-089542 |
| Prima anual | 9.434,00 € (IVA incl.) |
| Suma asegurada continente | 1.800.000 € |
| Suma asegurada contenido | 450.000 € |
| RC Explotación | 600.000 € |
| Franquicia general | 300 € |
| Vigencia | 1 feb 2025 - 31 ene 2026 |
| Preaviso cancelación | 30 días |

---

### 8. UTILITIES - Suministro Eléctrico

**Archivo:** `08-UTILITIES-Suministro-Electrico.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Comercializadora | Helios Energía Verde, S.L. |
| Cliente | Supermercados Ahorro Total, S.A. |
| CUPS | ES0021000012345678AB1P |
| Potencia contratada | P1-P2: 150 kW / P3-P6: 200 kW |
| Precio P1 (punta) | 0,1650 €/kWh |
| Duración | 24 meses |
| Fecha inicio | 1 de marzo de 2025 |
| Consumo anual estimado | 450.000 kWh |
| Preaviso resolución | 15 días |

---

### 9. LOGÍSTICA - Servicios Logísticos

**Archivo:** `09-LOGISTICA-Servicios-Logisticos.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Operador | Helios Logistics & Transport, S.A. |
| Cliente | Electrodomésticos Premium España, S.L. |
| Almacenaje | 2.500 m² |
| Precio almacenaje | 8,50 €/m²/mes |
| Transporte nacional (30kg) | 6,50 € |
| Duración | 3 años |
| Fecha inicio | 1 de febrero de 2025 |
| SLA entregas 24h | ≥ 95% |
| Penalización bajo volumen | 15% recargo |
| Preaviso resolución | 90 días |

---

### 10. FARMACÉUTICA - Distribución

**Archivo:** `10-FARMACEUTICA-Distribucion.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Laboratorio | BioHelios Pharmaceuticals, S.A. |
| Distribuidor | Helios Pharma Distribution, S.L. |
| Autorización AEMPS | DF-28-0456 |
| Productos | 5 medicamentos (Código Nacional) |
| Descuento base | 8% sobre PVP |
| Duración | 3 años |
| Fecha inicio | 1 de febrero de 2025 |
| Plazo pago | 60 días |
| Stock seguridad | 4 semanas |
| Preaviso resolución | 6 meses |

---

### 11. LEGAL - Servicios Jurídicos

**Archivo:** `11-LEGAL-Servicios-Juridicos.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Despacho | Helios Abogados & Asociados, S.L.P. |
| Cliente | Desarrollos Inmobiliarios Mediterráneo, S.A. |
| Asunto | Due diligence inmobiliaria + promoción |
| Due diligence | 12.000 € (precio cerrado) |
| Iguala mensual | 3.500 €/mes |
| Hora adicional socio | 250 €/hora |
| Valor operación | 25.000.000 € |
| Fecha inicio | 15 de enero de 2025 |
| Seguro RC | 3.000.000 € |
| Plazo pago | 15 días |

---

### 12. SECTOR PÚBLICO - Contrato Menor

**Archivo:** `12-SECTOR-PUBLICO-Contrato-Menor.pdf`

**Puntos de extracción a verificar:**

| Campo | Valor Esperado |
|-------|----------------|
| Órgano contratación | Ayuntamiento de Heliopolis |
| Contratista | Consultoría Digital Avanzada, S.L. |
| Expediente | 2025/CONT/00045 |
| Objeto | Plan Director Transformación Digital |
| Base imponible | 14.500,00 € |
| IVA | 3.045,00 € |
| Total | 17.545,00 € |
| Plazo ejecución | 3 meses |
| Fecha inicio | 1 de febrero de 2025 |
| Fecha fin | 30 de abril de 2025 |
| Plazo pago | 30 días |
| Base legal | Art. 118 LCSP |

---

## Cómo Usar para Testing

1. **Subir cada PDF** a la aplicación Helios
2. **Verificar extracción** de cada campo listado
3. **Comparar resultados** con los valores esperados
4. **Documentar discrepancias** para mejora del modelo

## Casos Especiales a Testear

- **Fechas en diferentes formatos:** "1 de febrero de 2025", "15/01/2025", "28 Feb 2025"
- **Importes con diferentes notaciones:** "25.000,00 €", "8.500.000 €", "0,1650 €/kWh"
- **Porcentajes:** "7,50%", "21%", "0,5%"
- **Períodos:** "60 meses", "5 años", "24 MESES", "3 meses"
- **Identificadores:** DNI, CIF, CUPS, Nº Póliza, Expediente
- **Cláusulas de resolución:** preaviso en días/meses
- **Penalizaciones:** importes fijos vs porcentajes

---

*Documentos generados: 25 de diciembre de 2025*
