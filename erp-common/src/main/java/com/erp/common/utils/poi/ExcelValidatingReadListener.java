package com.erp.common.utils.poi;

import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.event.AnalysisEventListener;
import com.alibaba.excel.exception.ExcelDataConvertException;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.reflect.ReflectUtils;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * EasyExcel 读取监听：收集数据行、sheet 行号，并做注解校验
 */
public class ExcelValidatingReadListener<T> extends AnalysisEventListener<T> {
    private final Class<T> clazz;
    private final List<T> rows = new ArrayList<>();
    private final List<Integer> sheetRowIndexes = new ArrayList<>();
    private final Map<Integer, String> errors = new LinkedHashMap<>();

    public ExcelValidatingReadListener(Class<T> clazz) {
        this.clazz = clazz;
    }

    @Override
    public void invoke(T data, AnalysisContext context) {
        if (isBlankRow(data)) {
            return;
        }
        int rowIndex = context.readRowHolder().getRowIndex();
        rows.add(data);
        sheetRowIndexes.add(rowIndex);
        String message = ExcelImportHelper.validateRow(data, clazz);
        if (StringUtils.isNotEmpty(message)) {
            errors.put(rowIndex, message);
        }
    }

    @Override
    public void onException(Exception exception, AnalysisContext context) throws Exception {
        int rowIndex = context.readRowHolder() == null ? -1 : context.readRowHolder().getRowIndex();
        if (rowIndex < 0) {
            throw exception;
        }
        String message;
        if (exception instanceof ExcelDataConvertException) {
            ExcelDataConvertException convertException = (ExcelDataConvertException) exception;
            int columnIndex = convertException.getColumnIndex();
            message = "第" + (columnIndex + 1) + "列数据格式不正确";
        } else {
            message = exception.getMessage() == null ? "数据解析失败" : exception.getMessage();
        }
        T placeholder;
        try {
            placeholder = clazz.getDeclaredConstructor().newInstance();
        } catch (Exception e) {
            throw exception;
        }
        rows.add(placeholder);
        sheetRowIndexes.add(rowIndex);
        String exists = errors.get(rowIndex);
        errors.put(rowIndex, StringUtils.isEmpty(exists) ? message : exists + "；" + message);
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // no-op
    }

    public List<T> getRows() {
        return rows;
    }

    public List<Integer> getSheetRowIndexes() {
        return sheetRowIndexes;
    }

    public Map<Integer, String> getErrors() {
        return errors;
    }

    private boolean isBlankRow(T data) {
        if (data == null) {
            return true;
        }
        for (Field field : clazz.getDeclaredFields()) {
            Object value = ReflectUtils.invokeGetter(data, field.getName());
            if (value == null) {
                continue;
            }
            if (value instanceof String) {
                if (StringUtils.isNotEmpty(((String) value).trim())) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }
}
