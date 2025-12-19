import DOMPurify from 'dompurify';

export const sanitizeConfig = {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'br', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
};

export const sanitizeHTML = (html: string) => {
    return DOMPurify.sanitize(html, sanitizeConfig);
};

export const sanitizeHTMLMinimal = (html: string) => {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['strong', 'em', 'br'],
        ALLOWED_ATTR: []
    });
};
