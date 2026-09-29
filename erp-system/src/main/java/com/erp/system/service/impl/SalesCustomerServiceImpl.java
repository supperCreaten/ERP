package com.erp.system.service.impl;

import com.erp.common.exception.ServiceException;
import com.erp.common.utils.StringUtils;
import com.erp.common.utils.bean.BeanUtils;
import com.erp.common.utils.poi.ExcelImportHelper;
import com.erp.common.utils.poi.ExcelImportResult;
import com.erp.system.domain.dto.CustomerAddDTO;
import com.erp.system.domain.dto.CustomerExcelDTO;
import com.erp.system.domain.dto.CustomerQueryDTO;
import com.erp.system.domain.dto.SysDictDataSaveReq;
import com.erp.system.domain.vo.CustomerVO;
import com.erp.system.mapper.CustomerMapper;
import com.erp.system.service.SalesCustomerService;
import com.erp.system.service.SysDictService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * 客户资料业务层处理
 */
@Service
public class SalesCustomerServiceImpl implements SalesCustomerService {

    private static final String DICT_CREDIT_LEVEL = "customer_credit_level";
    private static final String DICT_CATEGORY = "customer_category";

    @Autowired
    private CustomerMapper customerMapper;

    @Autowired
    private SysDictService dictService;

    /**
     * 校验并拆分省市区字段
     *
     * @param customerAddDTO 客户信息
     */
    private void checkRegionNotEmpty(CustomerAddDTO customerAddDTO) {
        List<String> region = customerAddDTO.getRegion();
        if (region != null && region.size() == 2) {
            customerAddDTO.setProvince(region.get(0));
            customerAddDTO.setCity(region.get(1));
        }
        if (customerAddDTO.getProvince() == null) {
            throw new ServiceException("省份不能为空");
        }
        if (customerAddDTO.getCity() == null) {
            throw new ServiceException("城市不能为空");
        }
    }

    /**
     * 校验客户名称是否唯一（同一省市下不可重复）
     *
     * @param customerAddDTO 客户信息
     */
    public void checkCustomerNameUnique(CustomerAddDTO customerAddDTO) {
        Long customerId = customerAddDTO.getCustomerId();
        String province = customerAddDTO.getProvince();
        String city = customerAddDTO.getCity();
        String customerName = customerAddDTO.getCustomerName();
        CustomerQueryDTO query = new CustomerQueryDTO();
        query.setProvince(province);
        query.setCity(city);
        query.setCustomerName(customerName);
        CustomerVO customerVO = customerMapper.selectCustomerByCustomerName(query);
        if (customerVO != null && !Objects.equals(customerVO.getCustomerId(), customerId)) {
            throw new ServiceException("客户名称重复");
        }
    }

    /**
     * 查询客户列表
     *
     * @param customerQueryDTO 查询条件
     * @return 客户集合
     */
    @Override
    public List<CustomerVO> selectCustomerList(CustomerQueryDTO customerQueryDTO) {
        List<String> region = customerQueryDTO.getRegion();
        if (region != null && region.size() == 2) {
            customerQueryDTO.setProvince(region.get(0));
            customerQueryDTO.setCity(region.get(1));
        }
        return customerMapper.selectCustomerList(customerQueryDTO);
    }

    /**
     * 新增客户资料
     *
     * @param customerAddDTO 客户信息
     */
    @Override
    public void insertSalesCustomer(CustomerAddDTO customerAddDTO) {
        checkRegionNotEmpty(customerAddDTO);
        checkCustomerNameUnique(customerAddDTO);
        customerMapper.insertCustomer(customerAddDTO);
    }

    /**
     * 修改客户资料
     *
     * @param customerAddDTO 客户信息
     */
    @Override
    public void updateSalesCustomer(CustomerAddDTO customerAddDTO) {
        if (customerAddDTO.getCustomerId() == null) {
            throw new ServiceException("主键ID不能为空");
        }
        checkRegionNotEmpty(customerAddDTO);
        checkCustomerNameUnique(customerAddDTO);
        customerMapper.updateCustomer(customerAddDTO);
    }

    /**
     * 根据客户ID查询详情
     *
     * @param customerId 客户ID
     * @return 客户详情
     */
    @Override
    public CustomerVO selectCustomerById(Long customerId) {
        if (customerId == null) {
            throw new ServiceException("主键ID不能为空");
        }
        List<String> region = new ArrayList<>();
        CustomerVO target = new CustomerVO();
        CustomerVO records = customerMapper.selectCustomerById(customerId);
        String province = records.getProvince();
        String city = records.getCity();
        region.add(province);
        region.add(city);
        records.setRegion(region);
        BeanUtils.copyBeanProp(target, records);
        return target;
    }

    /**
     * 批量删除客户
     *
     * @param customerIds 客户ID数组
     */
    @Override
    public void deleteSalesCustomer(Long[] customerIds) {
        if (customerIds == null || customerIds.length == 0) {
            throw new ServiceException("主键id不能为空");
        }
        customerMapper.deleteCustomerByIds(customerIds);
    }

    /**
     * 导入客户资料
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> importCustomers(MultipartFile file, boolean partialCommit) {
        if (file == null || file.isEmpty()) {
            throw new ServiceException("导入文件不能为空");
        }
        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (Exception e) {
            throw new ServiceException("读取导入文件失败：" + e.getMessage());
        }

        ExcelImportResult<CustomerExcelDTO> result = ExcelImportHelper.readAndValidate(fileBytes, CustomerExcelDTO.class, buildErrorFileName(file.getOriginalFilename()));

        Map<String, String> creditLevelMap = buildDictValueMap(DICT_CREDIT_LEVEL);
        Map<String, String> categoryMap = buildDictValueMap(DICT_CATEGORY);
        Set<String> batchKeys = new HashSet<>();

        List<CustomerExcelDTO> rows = result.getRows();
        List<Integer> sheetRowIndexes = result.getSheetRowIndexes();
        Map<Integer, String> errors = result.getErrors();
        if (errors == null) {
            errors = new LinkedHashMap<>();
            result.setErrors(errors);
        }

        List<CustomerAddDTO> toInsert = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            Integer sheetRow = sheetRowIndexes.get(i);
            if (errors.containsKey(sheetRow)) {
                continue;
            }
            CustomerExcelDTO row = rows.get(i);
            String dictError = validateImportDict(row, creditLevelMap, categoryMap);
            if (StringUtils.isNotEmpty(dictError)) {
                errors.put(sheetRow, dictError);
                continue;
            }
            CustomerAddDTO dto = toAddDTO(row, creditLevelMap, categoryMap);
            String uniqueKey = buildCustomerUniqueKey(dto);
            if (StringUtils.isNotEmpty(uniqueKey) && !batchKeys.add(uniqueKey)) {
                errors.put(sheetRow, "客户名称重复");
                continue;
            }
            try {
                // 与新增一致：省市必填 + 同省市客户名称唯一
                checkRegionNotEmpty(dto);
                checkCustomerNameUnique(dto);
            } catch (ServiceException e) {
                errors.put(sheetRow, e.getMessage());
                continue;
            }
            toInsert.add(dto);
        }

        if (!errors.isEmpty()) {
            result.setErrorFileBytes(ExcelImportHelper.writeErrorColumn(fileBytes, errors));
        }

        // 任一失败且不允许部分入库：整批不入库
        if (!errors.isEmpty() && !partialCommit) {
            return buildImportResult(true, errors.size(), 0, result, "校验失败，请下载错误文件查看");
        }

        int successCount = 0;
        for (CustomerAddDTO dto : toInsert) {
            // 与页面新增走同一套 insert 校验与入库逻辑
            insertSalesCustomer(dto);
            successCount++;
        }

        if (!errors.isEmpty()) {
            String message = String.format("成功导入 %d 条，失败 %d 条，请下载错误文件查看", successCount, errors.size());
            return buildImportResult(true, errors.size(), successCount, result, message);
        }
        return buildImportResult(false, 0, successCount, result, "成功导入 " + successCount + " 条");
    }

    @Override
    public List<CustomerExcelDTO> selectCustomerExportList(CustomerQueryDTO customerQueryDTO) {
        List<CustomerVO> list = selectCustomerList(customerQueryDTO);
        Map<String, String> creditLabelMap = buildDictLabelMap(DICT_CREDIT_LEVEL);
        Map<String, String> categoryLabelMap = buildDictLabelMap(DICT_CATEGORY);
        List<CustomerExcelDTO> exportList = new ArrayList<>(list.size());
        for (CustomerVO vo : list) {
            CustomerExcelDTO row = new CustomerExcelDTO();
            BeanUtils.copyBeanProp(row, vo);
            row.setCreditLevel(creditLabelMap.getOrDefault(vo.getCreditLevel(), vo.getCreditLevel()));
            row.setCategory(categoryLabelMap.getOrDefault(vo.getCategory(), vo.getCategory()));
            exportList.add(row);
        }
        return exportList;
    }

    private String validateImportDict(CustomerExcelDTO row, Map<String, String> creditLevelMap, Map<String, String> categoryMap) {
        List<String> messages = new ArrayList<>();
        if (StringUtils.isNotEmpty(row.getCreditLevel()) && !creditLevelMap.containsKey(row.getCreditLevel().trim())) {
            messages.add("信用等级不存在");
        }
        if (StringUtils.isNotEmpty(row.getCategory()) && !categoryMap.containsKey(row.getCategory().trim())) {
            messages.add("客户分类不存在");
        }
        return String.join("；", messages);
    }

    private String buildCustomerUniqueKey(CustomerAddDTO dto) {
        if (dto == null || StringUtils.isEmpty(dto.getProvince()) || StringUtils.isEmpty(dto.getCity()) || StringUtils.isEmpty(dto.getCustomerName())) {
            return null;
        }
        return dto.getProvince() + "|" + dto.getCity() + "|" + dto.getCustomerName();
    }

    private CustomerAddDTO toAddDTO(CustomerExcelDTO row, Map<String, String> creditLevelMap, Map<String, String> categoryMap) {
        CustomerAddDTO dto = new CustomerAddDTO();
        dto.setCustomerName(StringUtils.trim(row.getCustomerName()));
        dto.setShortName(StringUtils.trim(row.getShortName()));
        dto.setProvince(StringUtils.trim(row.getProvince()));
        dto.setCity(StringUtils.trim(row.getCity()));
        dto.setAddress(StringUtils.trim(row.getAddress()));
        dto.setCreditLevel(creditLevelMap.get(row.getCreditLevel().trim()));
        dto.setCategory(categoryMap.get(row.getCategory().trim()));
        dto.setBankName(StringUtils.trim(row.getBankName()));
        dto.setInvoiceAddress(StringUtils.trim(row.getInvoiceAddress()));
        dto.setBankAccount(StringUtils.trim(row.getBankAccount()));
        dto.setTaxNumber(StringUtils.trim(row.getTaxNumber()));
        dto.setContactPerson(StringUtils.trim(row.getContactPerson()));
        dto.setContactPhone(StringUtils.trim(row.getContactPhone()));
        if (StringUtils.isNotEmpty(row.getRemark())) {
            dto.setRemark(StringUtils.trim(row.getRemark()));
        }
        return dto;
    }

    /**
     * 字典 label/value -> dictValue，导入时填标签或键值均可
     */
    private Map<String, String> buildDictValueMap(String dictCode) {
        Map<String, String> map = new HashMap<>();
        List<SysDictDataSaveReq> items = dictService.selectDictDataByCode(dictCode);
        if (items == null) {
            return map;
        }
        for (SysDictDataSaveReq item : items) {
            if (item == null || StringUtils.isEmpty(item.getDictValue())) {
                continue;
            }
            map.put(item.getDictValue(), item.getDictValue());
            if (StringUtils.isNotEmpty(item.getDictLabel())) {
                map.put(item.getDictLabel(), item.getDictValue());
            }
        }
        return map;
    }

    /**
     * 字典 value -> label，导出时展示标签
     */
    private Map<String, String> buildDictLabelMap(String dictCode) {
        Map<String, String> map = new HashMap<>();
        List<SysDictDataSaveReq> items = dictService.selectDictDataByCode(dictCode);
        if (items == null) {
            return map;
        }
        for (SysDictDataSaveReq item : items) {
            if (item == null || StringUtils.isEmpty(item.getDictValue())) {
                continue;
            }
            map.put(item.getDictValue(), StringUtils.isNotEmpty(item.getDictLabel()) ? item.getDictLabel() : item.getDictValue());
        }
        return map;
    }

    private Map<String, Object> buildImportResult(boolean hasError, int errorCount, int successCount, ExcelImportResult<CustomerExcelDTO> result, String message) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("hasError", hasError);
        data.put("errorCount", errorCount);
        data.put("successCount", successCount);
        data.put("message", message);
        if (hasError && result.getErrorFileBytes() != null) {
            data.put("errorFile", ExcelImportHelper.toBase64(result.getErrorFileBytes()));
            data.put("errorFileName", result.getErrorFileName());
        }
        return data;
    }

    private String buildErrorFileName(String originalName) {
        if (StringUtils.isEmpty(originalName)) {
            return "客户导入_错误明细.xlsx";
        }
        int dot = originalName.lastIndexOf('.');
        String prefix = dot > 0 ? originalName.substring(0, dot) : originalName;
        return prefix + "_错误明细.xlsx";
    }
}
