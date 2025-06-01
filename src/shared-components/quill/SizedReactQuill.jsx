import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import PropTypes from 'prop-types';
import 'react-quill/dist/quill.snow.css';
import '../shared-css/ReactQuillSizes.scss';

/**
 * Wrapper component for ReactQuill with predefined sizes
 * Makes it easy to use consistent sizing across your application
 */
export default class SizedReactQuill extends Component {
    static propTypes = {
        size: PropTypes.oneOf(['small', 'medium', 'large', 'fixed', 'responsive', 'custom']),
        height: PropTypes.string, // Only used when size is 'custom'
        width: PropTypes.string,
        value: PropTypes.any,
        onChange: PropTypes.func,
        modules: PropTypes.object,
        placeholder: PropTypes.string,
        theme: PropTypes.string,
        readOnly: PropTypes.bool,
        style: PropTypes.object,
        className: PropTypes.string
    };

    static defaultProps = {
        size: 'medium',
        theme: 'snow',
        readOnly: false,
        placeholder: 'Enter your text here...'
    };

    // Default module configurations for different use cases
    getModules = () => {
        const { modules } = this.props;
        
        // If modules are provided, use them
        if (modules) return modules;

        // Default modules based on size
        switch (this.props.size) {
            case 'small':
                return {
                    toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                        ['link']
                    ]
                };
            case 'medium':
            case 'large':
            case 'fixed':
            case 'responsive':
            default:
                return {
                    toolbar: [
                        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        ['blockquote'],
                        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }, { 'align': [] }],
                        [{ 'script': 'sub' }, { 'script': 'super' }],
                        [{ 'color': [] }, { 'background': [] }],
                        ['link', 'image'],
                        ['clean']
                    ]
                };
        }
    };

    // Get CSS class based on size
    getSizeClass = () => {
        const { size } = this.props;
        
        switch (size) {
            case 'small':
                return 'quill-small quill-compact';
            case 'medium':
                return 'quill-medium';
            case 'large':
                return 'quill-large';
            case 'fixed':
                return 'quill-fixed';
            case 'responsive':
                return 'quill-responsive quill-full-width';
            case 'custom':
                return 'quill-custom';
            default:
                return 'quill-medium';
        }
    };

    // Get custom styles for 'custom' size
    getCustomStyles = () => {
        const { size, height, width, style } = this.props;
        
        if (size !== 'custom') return style || {};

        const customStyles = {
            ...(style || {}),
            ...(height && { height }),
            ...(width && { width })
        };

        return customStyles;
    };

    render() {
        const {
            size,
            height,
            width,
            value,
            onChange,
            placeholder,
            theme,
            readOnly,
            className,
            ...otherProps
        } = this.props;

        const sizeClass = this.getSizeClass();
        const customStyles = this.getCustomStyles();
        const modules = this.getModules();
        const combinedClassName = `${sizeClass} ${className || ''}`.trim();

        return (
            <div className={combinedClassName} style={customStyles}>
                <ReactQuill
                    theme={theme}
                    value={value}
                    onChange={onChange}
                    modules={modules}
                    placeholder={placeholder}
                    readOnly={readOnly}
                    {...otherProps}
                />
            </div>
        );
    }
}

// Export convenience components for common use cases
export const SmallQuill = (props) => (
    <SizedReactQuill size="small" {...props} />
);

export const MediumQuill = (props) => (
    <SizedReactQuill size="medium" {...props} />
);

export const LargeQuill = (props) => (
    <SizedReactQuill size="large" {...props} />
);

export const ResponsiveQuill = (props) => (
    <SizedReactQuill size="responsive" {...props} />
);
