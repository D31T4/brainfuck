
import React, { forwardRef } from 'react';

import './style.css';

const ErrorMessage = forwardRef<HTMLSpanElement, React.HTMLProps<HTMLSpanElement>>((props, ref) => {
    const { className, ...otherProps } = props;

    return (
        <span ref={ref} className={`${className || ''} error-message`} {...otherProps}>
            {props.children}
        </span>
    );
});

export default ErrorMessage;
