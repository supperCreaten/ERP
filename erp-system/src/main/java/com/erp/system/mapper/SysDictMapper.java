package com.erp.system.mapper;

import com.erp.system.domain.dto.SysDictSaveReq;

import java.util.List;

public interface SysDictMapper {
    List<SysDictSaveReq> selectDictList(SysDictSaveReq dict);

    List<SysDictSaveReq> selectDictAllList();

    /**
     * 新增字典
     *
     * @param dict 字典信息
     */
    int insertDict(SysDictSaveReq dict);

    /**
     * 根据主键id查询字典列表
     *
     * @param id 主键ID
     * @return 字典详情
     */
    SysDictSaveReq selectDictById(Long id);
    /**
     * 根据字典编码查询字典列表
     *
     * @param dictCode 字典编码
     * @return 字典详情
     */
    SysDictSaveReq selectDictByCode(String dictCode);
    /**
     * 更新字典配置
     *
     * @param dict 字典信息
     */
    int updateDict(SysDictSaveReq dict);

    /**
     * 删除字典配置
     *
     * @param id 主键id
     */
    int deleteDIctById(Long id);
}
