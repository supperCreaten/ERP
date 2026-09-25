package com.erp.common.utils.poi.converter;

import com.alibaba.excel.converters.Converter;
import com.alibaba.excel.enums.CellDataTypeEnum;
import com.alibaba.excel.metadata.GlobalConfiguration;
import com.alibaba.excel.metadata.data.ReadCellData;
import com.alibaba.excel.metadata.data.WriteCellData;
import com.alibaba.excel.metadata.property.ExcelContentProperty;
import com.erp.common.utils.StringUtils;

import java.math.BigDecimal;

/**
 * EasyExcel 字符串转换：数字单元格去尾随 0，避免 1280.0
 */
public class ExcelStringConverter implements Converter<String> {
    @Override
    public Class<?> supportJavaTypeKey() {
        return String.class;
    }

    @Override
    public CellDataTypeEnum supportExcelTypeKey() {
        return null;
    }

    @Override
    public String convertToJavaData(ReadCellData<?> cellData, ExcelContentProperty contentProperty,
                                    GlobalConfiguration globalConfiguration) {
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

    @Override
    public WriteCellData<?> convertToExcelData(String value, ExcelContentProperty contentProperty,
                                               GlobalConfiguration globalConfiguration) {
        return new WriteCellData<>(value == null ? "" : value);
    }
}
