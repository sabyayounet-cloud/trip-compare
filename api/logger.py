"""
Logging configuration for TripCompare API

Provides structured logging with file rotation and console output.
"""
import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from datetime import datetime


def setup_logger(name: str = "tripcompare", log_level: str = "INFO") -> logging.Logger:
    """
    Setup logger with both file and console handlers.

    Args:
        name: Logger name
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)

    Returns:
        Configured logger instance
    """
    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level.upper()))

    # Avoid duplicate handlers
    if logger.handlers:
        return logger

    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)

    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s | %(name)s | %(levelname)-8s | %(module)s:%(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    console_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(message)s',
        datefmt='%H:%M:%S'
    )

    # File handler with rotation (max 10MB, keep 5 backup files)
    log_file = log_dir / f"tripcompare_{datetime.now().strftime('%Y%m%d')}.log"
    file_handler = RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(detailed_formatter)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(console_formatter)

    # Error file handler (separate file for errors)
    error_file = log_dir / f"errors_{datetime.now().strftime('%Y%m%d')}.log"
    error_handler = RotatingFileHandler(
        error_file,
        maxBytes=10 * 1024 * 1024,
        backupCount=5,
        encoding='utf-8'
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)

    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    logger.addHandler(error_handler)

    return logger


# Create default logger instance
logger = setup_logger()


def log_api_call(endpoint: str, method: str, status_code: int, duration_ms: float):
    """Log API call details."""
    logger.info(
        f"API Call | {method} {endpoint} | Status: {status_code} | Duration: {duration_ms:.2f}ms"
    )


def log_external_api_call(provider: str, endpoint: str, status_code: int, duration_ms: float):
    """Log external API call details."""
    logger.info(
        f"External API | {provider} | {endpoint} | Status: {status_code} | Duration: {duration_ms:.2f}ms"
    )


def log_error(error: Exception, context: str = ""):
    """Log error with context."""
    logger.error(f"Error in {context}: {type(error).__name__}: {str(error)}", exc_info=True)


def log_warning(message: str):
    """Log warning message."""
    logger.warning(message)


def log_info(message: str):
    """Log info message."""
    logger.info(message)


def log_debug(message: str):
    """Log debug message."""
    logger.debug(message)
