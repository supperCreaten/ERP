package com.erp.common.utils.poi;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.write.style.column.LongestMatchColumnWidthStyleStrategy;
import com.erp.common.annotation.Excel;
import com.erp.common.exception.UtilException;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.poi.converter.ExcelIntegerExpConverter;
import com.erp.common.utils.poi.converter.ExcelStringConverter;
import com.erp.common.utils.reflect.ReflectUtils;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.reflect.Field;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 基于 EasyExcel 的导入公共能力：读取、注解校验、错误写回最后一列、模板下载
 */
public final class ExcelImportHelper {
    public static final String ERROR_COLUMN_NAME = "错误信息";

    private ExcelImportHelper() {
    }

    /**
     * 读取并按 {@link Excel} 注解做必填/格式校验；失败时生成带错误列的文件
     */
    public static <T> ExcelImportResult<T> readAndValidate(MultipartFile file, Class<T> clazz) {
        try {
            return readAndValidate(file.getBytes(), clazz, buildErrorFileName(file.getOriginalFilename()));
        } catch (UtilException e) {
            throw e;
        } catch (Exception e) {
            throw new UtilException("读取导入文件失败：" + e.getMessage());
        }
    }

    /**
     * 读取并按 {@link Excel} 注解做必填/格式校验
     */
    public static <T> ExcelImportResult<T> readAndValidate(byte[] fileBytes, Class<T> clazz) {
        return readAndValidate(fileBytes, clazz, "导入错误明细.xlsx");
    }

    /**
     * 使用 EasyExcel 读取，并按 {@link Excel} 做必填/格式校验
     */
    public static <T> ExcelImportResult<T> readAndValidate(byte[] fileBytes, Class<T> clazz, String errorFileName) {
        if (fileBytes == null || fileBytes.length == 0) {
            throw new UtilException("导入文件不能为空");
        }
        ExcelImportResult<T> result = new ExcelImportResult<>();
        result.setErrorFileName(StringUtils.isNotEmpty(errorFileName) ? errorFileName : "导入错误明细.xlsx");

        ExcelValidatingReadListener<T> listener = new ExcelValidatingReadListener<>(clazz);
        try {
            EasyExcel.read(new ByteArrayInputStream(fileBytes), clazz, listener)
                    .autoCloseStream(true)
                    .registerConverter(new ExcelStringConverter())
                    .registerConverter(new ExcelIntegerExpConverter())
                    .sheet()
                    .headRowNumber(1)
                    .doRead();
        } catch (Exception e) {
            throw new UtilException("读取导入文件失败：" + e.getMessage());
        }

        result.setRows(listener.getRows());
        result.setSheetRowIndexes(listener.getSheetRowIndexes());
        result.setErrors(new LinkedHashMap<>(listener.getErrors()));
        if (result.hasErrors()) {
            result.setErrorFileBytes(writeErrorColumn(fileBytes, result.getErrors()));
        }
        return result;
    }

    /**
     * 下载导入模板（仅表头）
     */
    public static <T> void writeTemplate(HttpServletResponse response, Class<T> clazz, String sheetName, String fileName) {
        try {
            String downloadName = StringUtils.isEmpty(fileName) ? sheetName + ".xlsx" : fileName;
            if (!downloadName.endsWith(".xlsx") && !downloadName.endsWith(".xls")) {
                downloadName = downloadName + ".xlsx";
            }
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setCharacterEncoding("utf-8");
            String encoded = URLEncoder.encode(downloadName, StandardCharsets.UTF_8).replaceAll("\\+", "%20");
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + encoded);
            writeTemplate(response.getOutputStream(), clazz, sheetName);
        } catch (Exception e) {
            throw new UtilException("下载导入模板失败：" + e.getMessage());
        }
    }

    /**
     * 写出导入模板到输出流
     */
    public static <T> void writeTemplate(OutputStream outputStream, Class<T> clazz, String sheetName) {
        EasyExcel.write(outputStream, clazz)
                .autoCloseStream(false)
                .registerConverter(new ExcelStringConverter())
                .registerConverter(new ExcelIntegerExpConverter())
                .registerWriteHandler(new LongestMatchColumnWidthStyleStrategy())
                .sheet(StringUtils.isEmpty(sheetName) ? "模板" : sheetName)
                .doWrite(Collections.emptyList());
    }

    /**
     * 仅按 {@link Excel} 注解校验已解析对象
     */
    public static <T> String validateRow(T row, Class<T> clazz) {
        if (row == null) {
            return "数据行为空";
        }
        List<String> messages = new ArrayList<>();
        for (Field field : clazz.getDeclaredFields()) {
            Excel excel = field.getAnnotation(Excel.class);
            if (excel == null || excel.type() == Excel.Type.EXPORT) {
                continue;
            }
            Object value = ReflectUtils.invokeGetter(row, field.getName());
            boolean blank = isBlankValue(value);
            if (excel.required() && blank) {
                messages.add(excel.name() + "不能为空");
                continue;
            }
            if (!blank && StringUtils.isNotEmpty(excel.pattern())) {
                String text = stringify(value);
                if (!text.matches(excel.pattern())) {
                    if (StringUtils.isNotEmpty(excel.patternMessage())) {
                        messages.add(excel.patternMessage());
                    } else {
                        messages.add(excel.name() + "格式不正确");
                    }
                }
            }
        }
        return String.join("；", messages);
    }

    /**
     * 将错误信息写入 Excel 最后一列（若已存在「错误信息」列则覆盖）
     */
    public static byte[] writeErrorColumn(byte[] fileBytes, Map<Integer, String> rowErrors) {
        return writeErrorColumn(fileBytes, rowErrors, ERROR_COLUMN_NAME);
    }

    /**
     * 将错误信息写入指定错误列（基于原始上传文件回写，保留原内容）
     */
    public static byte[] writeErrorColumn(byte[] fileBytes, Map<Integer, String> rowErrors, String errorHeader) {
        if (fileBytes == null || fileBytes.length == 0) {
            throw new UtilException("原始文件不能为空");
        }
        if (rowErrors == null || rowErrors.isEmpty()) {
            return fileBytes;
        }
        try (InputStream in = new ByteArrayInputStream(fileBytes);
             Workbook workbook = WorkbookFactory.create(in);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                headerRow = sheet.createRow(0);
            }
            int errorCol = findOrCreateErrorColumn(headerRow, errorHeader);

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.RED.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Cell headerCell = headerRow.getCell(errorCol);
            if (headerCell == null) {
                headerCell = headerRow.createCell(errorCol);
            }
            headerCell.setCellValue(errorHeader);
            headerCell.setCellStyle(headerStyle);

            CellStyle errorStyle = workbook.createCellStyle();
            Font errorFont = workbook.createFont();
            errorFont.setColor(IndexedColors.RED.getIndex());
            errorStyle.setFont(errorFont);
            errorStyle.setWrapText(true);

            int lastRow = sheet.getLastRowNum();
            for (int r = 1; r <= lastRow; r++) {
                Row row = sheet.getRow(r);
                if (row == null) {
                    continue;
                }
                Cell old = row.getCell(errorCol);
                if (old != null) {
                    row.removeCell(old);
                }
            }
            for (Map.Entry<Integer, String> entry : rowErrors.entrySet()) {
                Integer rowIndex = entry.getKey();
                if (rowIndex == null || rowIndex < 1) {
                    continue;
                }
                Row row = sheet.getRow(rowIndex);
                if (row == null) {
                    row = sheet.createRow(rowIndex);
                }
                Cell cell = row.createCell(errorCol);
                cell.setCellValue(entry.getValue());
                cell.setCellStyle(errorStyle);
            }
            sheet.setColumnWidth(errorCol, 80 * 256);
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new UtilException("生成错误文件失败：" + e.getMessage());
        }
    }

    /**
     * 错误文件转 Base64，便于接口返回
     */
    public static String toBase64(byte[] fileBytes) {
        if (fileBytes == null || fileBytes.length == 0) {
            return "";
        }
        return Base64.getEncoder().encodeToString(fileBytes);
    }

    private static String buildErrorFileName(String originalName) {
        if (StringUtils.isEmpty(originalName)) {
            return "导入错误明细.xlsx";
        }
        int dot = originalName.lastIndexOf('.');
        String prefix = dot > 0 ? originalName.substring(0, dot) : originalName;
        return prefix + "_错误明细.xlsx";
    }

    private static int findOrCreateErrorColumn(Row headerRow, String errorHeader) {
        short lastCellNum = headerRow.getLastCellNum();
        if (lastCellNum < 0) {
            return 0;
        }
        DataFormatter formatter = new DataFormatter();
        for (int i = 0; i < lastCellNum; i++) {
            Cell cell = headerRow.getCell(i);
            if (cell == null) {
                continue;
            }
            String value = StringUtils.trim(formatter.formatCellValue(cell));
            if (errorHeader.equals(value)) {
                return i;
            }
        }
        return lastCellNum;
    }

    private static boolean isBlankValue(Object value) {
        if (value == null) {
            return true;
        }
        if (value instanceof String) {
            return StringUtils.isEmpty(((String) value).trim());
        }
        return false;
    }

    private static String stringify(Object value) {
        if (value == null) {
            return "";
        }
        if (value instanceof String) {
            return ((String) value).trim();
        }
        return String.valueOf(value).trim();
    }
}
