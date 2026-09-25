package com.erp.common.utils.log;

/**
 * 操作日志字段变更项
 */
public class OperChangeItem
{
    private String field;
    private String label;
    private Object before;
    private Object after;

    public OperChangeItem()
    {
    }

    public OperChangeItem(String field, String label, Object before, Object after)
    {
        this.field = field;
        this.label = label;
        this.before = before;
        this.after = after;
    }

    public String getField()
    {
        return field;
    }

    public void setField(String field)
    {
        this.field = field;
    }

    public String getLabel()
    {
        return label;
    }

    public void setLabel(String label)
    {
        this.label = label;
    }

    public Object getBefore()
    {
        return before;
    }

    public void setBefore(Object before)
    {
        this.before = before;
    }

    public Object getAfter()
    {
        return after;
    }

    public void setAfter(Object after)
    {
        this.after = after;
    }
}
