package com.erp.common.core.service;

import com.erp.common.core.domain.model.RegisterBody;

/**
 * Register service abstraction. Implemented in framework.
 *
 * @author finance
 */
public interface ISysRegisterService
{
    String register(RegisterBody registerBody);
}
