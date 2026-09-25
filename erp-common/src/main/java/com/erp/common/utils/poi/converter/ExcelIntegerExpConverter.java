package com.erp.common.utils.poi.converter;

import com.alibaba.excel.converters.Converter;
import com.alibaba.excel.enums.CellDataTypeEnum;
import com.alibaba.excel.metadata.GlobalConfiguration;
import com.alibaba.excel.metadata.data.ReadCellData;
import com.alibaba.excel.metadata.data.WriteCellData;
import com.alibaba.excel.metadata.property.ExcelContentProperty;
import com.erp.common.annotation.Excel;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.poi.ExcelUtil;

import java.lang.reflect.Field;
import java.math.BigDecimal;

/**
 * EasyExcel 转换器：按 {@link Excel#readConverterExp()} 将单元格文本转为 Integer
 */
public class ExcelIntegerExpConverter implements Converter<Integer> {
    @Override
    public Class<?> supportJavaTypeKey() {
        return Integer.class;
    }

    @Override
    public CellDataTypeEnum supportExcelTypeKey() {
        return null;
    }

    @Override
    public Integer convertToJavaData(ReadCellData<?> cellData, ExcelContentProperty contentProperty,
                                     GlobalConfiguration globalConfiguration) {
        String raw = readAsString(cellData);
        if (StringUtils.isEmpty(raw)) {
            return null;
        }
        Field field = contentProperty == null ? null : contentProperty.getField();
        Excel excel = field == null ? null : field.getAnnotation(Excel.class);
        if (excel != null && StringUtils.isNotEmpty(excel.readConverterExp())) {
            String converted = ExcelUtil.reverseByExp(raw, excel.readConverterExp(), excel.separator());
            if (StringUtils.isEmpty(converted)) {
                return null;
            }
            return Integer.valueOf(converted.trim());
        }
        if (StringUtils.isNumeric(raw)) {
            return Integer.valueOf(raw);
        }
        return null;
    }

    @Override
    public WriteCellData<?> convertToExcelData(Integer value, ExcelContentProperty contentProperty,
                                               GlobalConfiguration globalConfiguration) {
        if (value == null) {
            return new WriteCellData<>("");
        }
        Field field = contentProperty == null ? null : contentProperty.getField();
        Excel excel = field == null ? null : field.getAnnotation(Excel.class);
        if (excel != null && StringUtils.isNotEmpty(excel.readConverterExp())) {
            return new WriteCellData<>(ExcelUtil.convertByExp(String.valueOf(value), excel.readConverterExp(), excel.separator()));
        }
        return new WriteCellData<>(String.valueOf(value));
    }

    private static String readAsString(ReadCellData<?> cellData) {
        if (cellData == null) {
            return null;
        }
        if (cellData.getType() == CellDataTypeEnum.NUMBER && cellData.getNumberValue() != null) {
            return cellData.getNumberValue().stripTrailingZeros().toPlainString();
        }
        if (cellData.getType() == CellDataTypeEnum.BOOLEAN && cellData.getBooleanValue() != null) {
            return String.valueOf(cellData.getBooleanValue());
        }
        String str = cellData.getStringValue();
        if (StringUtils.isNotEmpty(str)) {
            return str.trim();
        }
        BigDecimal number = cellData.getNumberValue();
        if (number != null) {
            return number.stripTrailingZeros().toPlainString();
        }
        return null;
    }
}
