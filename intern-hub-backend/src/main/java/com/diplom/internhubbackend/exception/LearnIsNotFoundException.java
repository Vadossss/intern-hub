package com.diplom.internhubbackend.exception;

import org.apache.logging.log4j.message.Message;

public class LearnIsNotFoundException extends RuntimeException{
    public LearnIsNotFoundException(String message) {
        super(message);
    }
}
