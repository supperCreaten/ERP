package com.erp.system.domain.vo;

import java.util.function.Function;

/**
 * 汇总累加器：不绑定具体 VO，通过接口或字段提取器计算。
 */
public class OrderSummary {
    private int householdCount;   // 总户数
    private int population;       // 总人数
    private int unitCount;        // 总单元数

    public int getHouseholdCount() {
        return householdCount;
    }

    public void setHouseholdCount(int householdCount) {
        this.householdCount = householdCount;
    }

    public int getPopulation() {
        return population;
    }

    public void setPopulation(int population) {
        this.population = population;
    }

    public int getUnitCount() {
        return unitCount;
    }

    public void setUnitCount(int unitCount) {
        this.unitCount = unitCount;
    }

    /**
     * VO 实现此接口后可直接 {@link #add(OrderSummaryItem)}。
     */
    public interface OrderSummaryItem {
        Integer getHouseholdCount();

        /**
         * 人数：支持 Integer / Long / String / null
         */
        Object getPopulation();

        Integer getUnitCount();
    }

    /** 按统一接口累加（推荐：各 VO implements OrderSummaryItem） */
    public OrderSummary add(OrderSummaryItem item) {
        if (item == null) {
            return this;
        }
        return addValues(item.getHouseholdCount(), item.getPopulation(), item.getUnitCount());
    }

    /**
     * 按字段提取器累加，适用于不想改 VO 继承关系的场景。
     * <pre>
     * summary.add(vo,
     *     XxxVo::getHouseholdCount,
     *     XxxVo::getPopulation,
     *     XxxVo::getUnitCount);
     * </pre>
     */
    public <T> OrderSummary add(T source,
                                Function<? super T, Integer> householdCountGetter,
                                Function<? super T, ?> populationGetter,
                                Function<? super T, Integer> unitCountGetter) {
        if (source == null) {
            return this;
        }
        Integer household = householdCountGetter == null ? null : householdCountGetter.apply(source);
        Object populationVal = populationGetter == null ? null : populationGetter.apply(source);
        Integer unit = unitCountGetter == null ? null : unitCountGetter.apply(source);
        return addValues(household, populationVal, unit);
    }

    public OrderSummary addValues(Integer householdCount, Object population, Integer unitCount) {
        this.householdCount += nullToZero(householdCount);
        this.population += toInt(population);
        this.unitCount += nullToZero(unitCount);
        return this;
    }

    public OrderSummary merge(OrderSummary other) {
        if (other == null) {
            return this;
        }
        this.householdCount += other.householdCount;
        this.population += other.population;
        this.unitCount += other.unitCount;
        return this;
    }

    private static int nullToZero(Integer value) {
        return value == null ? 0 : value;
    }

    private static int toInt(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        String text = value.toString().trim();
        if (text.isEmpty()) {
            return 0;
        }
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException e) {
            return 0;
        }
    }
}
