import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import FlexView from 'react-flexview';
import { Typography, Paper, Button } from '@material-ui/core';
import { css, StyleSheet } from 'aphrodite';
import 'react-quill/dist/quill.snow.css';
import '../shared-css/ReactQuillSizes.scss';

/**
 * Comprehensive example component showing different ReactQuill sizing approaches
 */
export default class ReactQuillSizingExamples extends Component {
    state = {
        smallContent: '',
        mediumContent: '',
        largeContent: '',
        customContent: '',
        responsiveContent: ''
    };

    handleQuillChange = (field) => (content) => {
        this.setState({ [field]: content });
    };

    // Basic toolbar configuration
    basicModules = {
        toolbar: [
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link']
        ]
    };

    // Full toolbar configuration (from your existing code)
    fullModules = {
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

    render() {
        const { smallContent, mediumContent, largeContent, customContent, responsiveContent } = this.state;

        return (
            <FlexView column style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
                <Typography variant="h4" gutterBottom>
                    ReactQuill Sizing Examples
                </Typography>

                {/* Approach 1: CSS Classes */}
                <Paper elevation={2} style={{ padding: 20, marginBottom: 30 }}>
                    <Typography variant="h6" gutterBottom>
                        1. Small Editor (CSS Class) - 150px min-height
                    </Typography>
                    <div className="quill-small quill-compact">
                        <ReactQuill
                            theme="snow"
                            value={smallContent}
                            onChange={this.handleQuillChange('smallContent')}
                            modules={this.basicModules}
                            placeholder="Small editor for quick comments..."
                        />
                    </div>
                </Paper>

                <Paper elevation={2} style={{ padding: 20, marginBottom: 30 }}>
                    <Typography variant="h6" gutterBottom>
                        2. Medium Editor (CSS Class) - 300px min-height
                    </Typography>
                    <div className="quill-medium">
                        <ReactQuill
                            theme="snow"
                            value={mediumContent}
                            onChange={this.handleQuillChange('mediumContent')}
                            modules={this.fullModules}
                            placeholder="Medium editor for standard forms..."
                        />
                    </div>
                </Paper>

                <Paper elevation={2} style={{ padding: 20, marginBottom: 30 }}>
                    <Typography variant="h6" gutterBottom>
                        3. Large Editor (CSS Class) - 500px min-height
                    </Typography>
                    <div className="quill-large">
                        <ReactQuill
                            theme="snow"
                            value={largeContent}
                            onChange={this.handleQuillChange('largeContent')}
                            modules={this.fullModules}
                            placeholder="Large editor for detailed content..."
                        />
                    </div>
                </Paper>

                {/* Approach 2: Inline Styles */}
                <Paper elevation={2} style={{ padding: 20, marginBottom: 30 }}>
                    <Typography variant="h6" gutterBottom>
                        4. Custom Size with Inline Styles
                    </Typography>
                    <ReactQuill
                        theme="snow"
                        value={customContent}
                        onChange={this.handleQuillChange('customContent')}
                        modules={this.fullModules}
                        style={{
                            height: '400px',
                            marginBottom: '50px' // Space for toolbar
                        }}
                        placeholder="Custom sized editor with inline styles..."
                    />
                </Paper>

                {/* Approach 3: Responsive Design */}
                <Paper elevation={2} style={{ padding: 20, marginBottom: 30 }}>
                    <Typography variant="h6" gutterBottom>
                        5. Responsive Editor (Adapts to Screen Size)
                    </Typography>
                    <div className="quill-responsive quill-full-width">
                        <ReactQuill
                            theme="snow"
                            value={responsiveContent}
                            onChange={this.handleQuillChange('responsiveContent')}
                            modules={this.fullModules}
                            placeholder="Responsive editor that adapts to screen size..."
                        />
                    </div>
                </Paper>

                {/* Approach 4: Styled Components using Aphrodite */}
                <Paper elevation={2} style={{ padding: 20, marginBottom: 30 }}>
                    <Typography variant="h6" gutterBottom>
                        6. Styled with Aphrodite (Following your existing pattern)
                    </Typography>
                    <div className={css(styles.customQuillContainer)}>
                        <ReactQuill
                            theme="snow"
                            value=""
                            onChange={() => {}}
                            modules={this.fullModules}
                            placeholder="Editor styled with Aphrodite..."
                        />
                    </div>
                </Paper>

                {/* Best Practices Section */}
                <Paper elevation={2} style={{ padding: 20, backgroundColor: '#f5f5f5' }}>
                    <Typography variant="h6" gutterBottom>
                        Best Practices for ReactQuill Sizing:
                    </Typography>
                    <ul style={{ marginLeft: 20, color: '#666' }}>
                        <li><strong>Use CSS classes</strong> for consistent sizing across your app</li>
                        <li><strong>Set min-height</strong> instead of fixed height for flexibility</li>
                        <li><strong>Add overflow-y: auto</strong> for scrollable content when needed</li>
                        <li><strong>Use responsive design</strong> for different screen sizes</li>
                        <li><strong>Adjust toolbar size</strong> for compact editors</li>
                        <li><strong>Import the CSS</strong> file in your main component or App.js</li>
                    </ul>
                </Paper>
            </FlexView>
        );
    }
}

// Aphrodite styles (following your existing pattern)
const styles = StyleSheet.create({
    customQuillContainer: {
        // Custom container styles
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        
        // Target the editor specifically
        '& .ql-editor': {
            minHeight: '350px !important',
            fontSize: '1.1em',
            padding: '20px'
        },
        
        // Style the toolbar
        '& .ql-toolbar.ql-snow': {
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #e0e0e0'
        }
    }
});
