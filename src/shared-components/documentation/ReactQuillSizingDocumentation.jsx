import React from 'react';
import { Typography, Paper } from '@material-ui/core';
import FlexView from 'react-flexview';

/**
 * Documentation for ReactQuill sizing approaches
 */
const ReactQuillSizingDocumentation = () => {
    return (
        <FlexView column style={{ padding: 20, maxWidth: 1000, margin: '0 auto' }}>
            <Typography variant="h3" gutterBottom>
                ReactQuill Sizing Guide
            </Typography>

            <Paper elevation={2} style={{ padding: 20, marginBottom: 20 }}>
                <Typography variant="h5" gutterBottom>
                    Quick Start
                </Typography>
                <Typography paragraph>
                    Import the CSS file in your component and use predefined classes:
                </Typography>
                <pre style={{ backgroundColor: '#f5f5f5', padding: 15, borderRadius: 5 }}>
{`// In your component
import '../../shared-css/ReactQuillSizes.scss';

// Wrap your ReactQuill with a size class
<div className="quill-medium">
    <ReactQuill
        theme="snow"
        value={content}
        onChange={handleChange}
        placeholder="Enter text..."
    />
</div>`}
                </pre>
            </Paper>

            <Paper elevation={2} style={{ padding: 20, marginBottom: 20 }}>
                <Typography variant="h5" gutterBottom>
                    Available Size Classes
                </Typography>
                <ul>
                    <li><strong>quill-small</strong> - 150px min-height, compact toolbar</li>
                    <li><strong>quill-medium</strong> - 300px min-height (default)</li>
                    <li><strong>quill-large</strong> - 500px min-height</li>
                    <li><strong>quill-fixed</strong> - 250px fixed height</li>
                    <li><strong>quill-responsive</strong> - Adapts to screen size</li>
                </ul>
                <Typography paragraph style={{ marginTop: 15 }}>
                    Combine with modifiers:
                </Typography>
                <ul>
                    <li><strong>quill-compact</strong> - Smaller toolbar buttons</li>
                    <li><strong>quill-full-width</strong> - Takes full width of container</li>
                    <li><strong>quill-constrained</strong> - Max width 800px, centered</li>
                </ul>
            </Paper>

            <Paper elevation={2} style={{ padding: 20, marginBottom: 20 }}>
                <Typography variant="h5" gutterBottom>
                    Using the Wrapper Component
                </Typography>
                <pre style={{ backgroundColor: '#f5f5f5', padding: 15, borderRadius: 5 }}>
{`import SizedReactQuill, { SmallQuill, MediumQuill, LargeQuill } from '../quill/SizedReactQuill';

// Use predefined sizes
<SmallQuill
    value={content}
    onChange={handleChange}
    placeholder="Quick comment..."
/>

<MediumQuill
    value={content}
    onChange={handleChange}
    placeholder="Standard form..."
/>

// Or use the main component with custom size
<SizedReactQuill
    size="custom"
    height="400px"
    width="100%"
    value={content}
    onChange={handleChange}
/>`}
                </pre>
            </Paper>

            <Paper elevation={2} style={{ padding: 20, marginBottom: 20 }}>
                <Typography variant="h5" gutterBottom>
                    Inline Styles Approach
                </Typography>
                <Typography paragraph>
                    For one-off customizations (as seen in your existing SuperAdminSettings):
                </Typography>
                <pre style={{ backgroundColor: '#f5f5f5', padding: 15, borderRadius: 5 }}>
{`<ReactQuill
    theme="snow"
    value={content}
    onChange={handleChange}
    style={{
        marginTop: 20,
        height: '300px' // Custom height
    }}
/>`}
                </pre>
            </Paper>

            <Paper elevation={2} style={{ padding: 20, marginBottom: 20 }}>
                <Typography variant="h5" gutterBottom>
                    Responsive Design Example
                </Typography>
                <pre style={{ backgroundColor: '#f5f5f5', padding: 15, borderRadius: 5 }}>
{`// CSS
.my-responsive-quill .ql-editor {
    min-height: 200px !important;
}

@media (min-width: 768px) {
    .my-responsive-quill .ql-editor {
        min-height: 350px !important;
    }
}

@media (min-width: 1024px) {
    .my-responsive-quill .ql-editor {
        min-height: 500px !important;
    }
}

// Component
<div className="my-responsive-quill">
    <ReactQuill ... />
</div>`}
                </pre>
            </Paper>

            <Paper elevation={2} style={{ padding: 20, backgroundColor: '#e8f5e8' }}>
                <Typography variant="h5" gutterBottom>
                    Best Practices
                </Typography>
                <ol>
                    <li><strong>Consistency:</strong> Use CSS classes for consistent sizing across your app</li>
                    <li><strong>Flexibility:</strong> Prefer min-height over fixed height for better content adaptation</li>
                    <li><strong>Responsiveness:</strong> Consider different screen sizes, especially for mobile</li>
                    <li><strong>Context:</strong> Match editor size to the expected content length</li>
                    <li><strong>Performance:</strong> Import CSS files once at the component level, not globally unless needed everywhere</li>
                    <li><strong>Accessibility:</strong> Ensure adequate space for toolbar and content</li>
                </ol>
            </Paper>

            <Paper elevation={2} style={{ padding: 20, backgroundColor: '#fff3cd' }}>
                <Typography variant="h5" gutterBottom>
                    Migration from Your Current Code
                </Typography>
                <Typography paragraph>
                    To update your existing ReactQuill components:
                </Typography>
                <ol>
                    <li>Import the ReactQuillSizes.scss file</li>
                    <li>Wrap your ReactQuill components with appropriate size classes</li>
                    <li>Remove inline height styles where appropriate</li>
                    <li>Test on different screen sizes</li>
                    <li>Consider using the SizedReactQuill wrapper for new components</li>
                </ol>
            </Paper>
        </FlexView>
    );
};

export default ReactQuillSizingDocumentation;
