package com.erp.system.service;

import com.erp.system.domain.dto.SysDictDataSaveReq;
import com.erp.system.domain.dto.SysDictQuery;
import com.erp.system.domain.dto.SysDictSaveReq;

import java.util.List;

public interface SysDictService {
    /**
     * 查询系统字典列表
     *
     * @return 菜单列表
     */
    List<SysDictSaveReq> selectDictList(SysDictQuery query);

    /**
     * 新增保存菜单信息
     *
     * @param dict 字典信息
     */
    void insertDict(SysDictSaveReq dict);

    /**
     * 新增保存菜单信息
     *
     * @param dict 字典信息
     */
    void updateDict(SysDictSaveReq dict);

    /**
     * 根据主键id查询字典列表
     *
     * @param id 主键ID
     * @return 字典详情
     */
    SysDictSaveReq selectDictByDictId(Long id);
    /**
     * 根据字典编码查询字典列表
     *
     * @param dictCode 字典编码
     * @return 字典列表
     */
    List<SysDictDataSaveReq> selectDictDataByCode(String dictCode);
    /**
     * 根据主键id删除字典列表
     *
     * @param ids 主键ID集合
     */
    void deleteDictById(List<Long> ids);
}
