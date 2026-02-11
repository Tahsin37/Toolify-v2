'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/* 
 * Tool Registry Component
 * Dynamically imports the correct tool component based on the slug.
 */

// SEO Tools
const MetaTitleChecker = dynamic(() => import('@/components/tools/seo/meta-title-checker').then(mod => mod.MetaTitleChecker), {
    loading: () => <ToolLoading />,
});

const MetaDescriptionChecker = dynamic(() => import('@/components/tools/seo/meta-description-checker').then(mod => mod.MetaDescriptionChecker), {
    loading: () => <ToolLoading />,
});

const RobotsValidator = dynamic(() => import('@/components/tools/seo/robots-validator').then(mod => mod.RobotsValidator), {
    loading: () => <ToolLoading />,
});

const CanonicalChecker = dynamic(() => import('@/components/tools/seo/canonical-checker').then(mod => mod.CanonicalChecker), {
    loading: () => <ToolLoading />,
});

const HeadingAnalyzer = dynamic(() => import('@/components/tools/seo/heading-analyzer').then(mod => mod.HeadingAnalyzer), {
    loading: () => <ToolLoading />,
});

const KeywordDensity = dynamic(() => import('@/components/tools/seo/keyword-density').then(mod => mod.KeywordDensity), {
    loading: () => <ToolLoading />,
});

const SeoChecker = dynamic(() => import('@/components/tools/seo/seo-checker').then(mod => mod.SeoChecker), {
    loading: () => <ToolLoading />,
});

const SlugOptimizer = dynamic(() => import('@/components/tools/seo/slug-optimizer').then(mod => mod.SlugOptimizer), {
    loading: () => <ToolLoading />,
});

const SerpPreview = dynamic(() => import('@/components/tools/seo/serp-preview').then(mod => mod.SerpPreview), {
    loading: () => <ToolLoading />,
});

const NoindexChecker = dynamic(() => import('@/components/tools/seo/noindex-checker').then(mod => mod.NoindexChecker), {
    loading: () => <ToolLoading />,
});

const SitemapCounter = dynamic(() => import('@/components/tools/seo/sitemap-counter').then(mod => mod.SitemapCounter), {
    loading: () => <ToolLoading />,
});

const WebsiteAnalyzer = dynamic(() => import('@/components/tools/seo/website-analyzer').then(mod => mod.WebsiteAnalyzer), {
    loading: () => <ToolLoading />,
});

const WebsiteSafetyChecker = dynamic(() => import('@/components/tools/seo/website-safety-checker').then(mod => mod.WebsiteSafetyChecker), {
    loading: () => <ToolLoading />,
});

// Developer Tools
const JsonFormatter = dynamic(() => import('@/components/tools/developer/json-formatter').then(mod => mod.JsonFormatter), {
    loading: () => <ToolLoading />,
});

const Base64Codec = dynamic(() => import('@/components/tools/developer/base64-codec').then(mod => mod.Base64Codec), {
    loading: () => <ToolLoading />,
});

const UrlCodec = dynamic(() => import('@/components/tools/developer/url-codec').then(mod => mod.UrlCodec), {
    loading: () => <ToolLoading />,
});

const RegexTester = dynamic(() => import('@/components/tools/developer/regex-tester').then(mod => mod.RegexTester), {
    loading: () => <ToolLoading />,
});

const JwtDecoder = dynamic(() => import('@/components/tools/developer/jwt-decoder').then(mod => mod.JwtDecoder), {
    loading: () => <ToolLoading />,
});

const JsonCsvConverter = dynamic(() => import('@/components/tools/developer/json-csv-converter').then(mod => mod.JsonCsvConverter), {
    loading: () => <ToolLoading />,
});

// Text Tools
const WordCounter = dynamic(() => import('@/components/tools/text/word-counter').then(mod => mod.WordCounter), {
    loading: () => <ToolLoading />,
});

const CaseConverter = dynamic(() => import('@/components/tools/text/case-converter').then(mod => mod.CaseConverter), {
    loading: () => <ToolLoading />,
});

const CharacterCounter = dynamic(() => import('@/components/tools/text/character-counter').then(mod => mod.CharacterCounter), {
    loading: () => <ToolLoading />,
});

const DiffChecker = dynamic(() => import('@/components/tools/text/diff-checker').then(mod => mod.DiffChecker), {
    loading: () => <ToolLoading />,
});

const DuplicateRemover = dynamic(() => import('@/components/tools/text/duplicate-remover').then(mod => mod.DuplicateRemover), {
    loading: () => <ToolLoading />,
});

const WhitespaceCleaner = dynamic(() => import('@/components/tools/text/whitespace-cleaner').then(mod => mod.WhitespaceCleaner), {
    loading: () => <ToolLoading />,
});

// Social Tools
const HashtagCounter = dynamic(() => import('@/components/tools/social/hashtag-counter').then(mod => mod.HashtagCounter), {
    loading: () => <ToolLoading />,
});

const TwitterCounter = dynamic(() => import('@/components/tools/social/twitter-counter').then(mod => mod.TwitterCounter), {
    loading: () => <ToolLoading />,
});

const InstagramBioChecker = dynamic(() => import('@/components/tools/social/instagram-bio').then(mod => mod.InstagramBioChecker), {
    loading: () => <ToolLoading />,
});

const YouTubeTitleChecker = dynamic(() => import('@/components/tools/social/youtube-title').then(mod => mod.YouTubeTitleChecker), {
    loading: () => <ToolLoading />,
});

const YouTubeDescriptionChecker = dynamic(() => import('@/components/tools/social/youtube-description').then(mod => mod.YouTubeDescriptionChecker), {
    loading: () => <ToolLoading />,
});

// Web Tools
const UserAgentParser = dynamic(() => import('@/components/tools/web/user-agent-parser').then(mod => mod.UserAgentParser), {
    loading: () => <ToolLoading />,
});

const HttpHeaderViewer = dynamic(() => import('@/components/tools/web/http-header-viewer').then(mod => mod.HttpHeaderViewer), {
    loading: () => <ToolLoading />,
});

const PageSizeChecker = dynamic(() => import('@/components/tools/web/page-size-checker').then(mod => mod.PageSizeChecker), {
    loading: () => <ToolLoading />,
});

// Converter Tools
const PngToJpg = dynamic(() => import('@/components/tools/converter/png-to-jpg').then(mod => mod.PngToJpg), {
    loading: () => <ToolLoading />,
});

const JpgToPng = dynamic(() => import('@/components/tools/converter/jpg-to-png').then(mod => mod.JpgToPng), {
    loading: () => <ToolLoading />,
});

const ImageToWebp = dynamic(() => import('@/components/tools/converter/image-to-webp').then(mod => mod.ImageToWebp), {
    loading: () => <ToolLoading />,
});

const WebpToPng = dynamic(() => import('@/components/tools/converter/webp-to-png').then(mod => mod.WebpToPng), {
    loading: () => <ToolLoading />,
});

const ImageResizer = dynamic(() => import('@/components/tools/converter/image-resizer').then(mod => mod.ImageResizer), {
    loading: () => <ToolLoading />,
});

const ImageToBase64 = dynamic(() => import('@/components/tools/converter/image-to-base64').then(mod => mod.ImageToBase64), {
    loading: () => <ToolLoading />,
});

const CsvToJson = dynamic(() => import('@/components/tools/converter/csv-to-json').then(mod => mod.CsvToJson), {
    loading: () => <ToolLoading />,
});

const JsonToCsv = dynamic(() => import('@/components/tools/converter/json-to-csv').then(mod => mod.JsonToCsv), {
    loading: () => <ToolLoading />,
});

const MarkdownToHtml = dynamic(() => import('@/components/tools/converter/markdown-to-html').then(mod => mod.MarkdownToHtml), {
    loading: () => <ToolLoading />,
});

const HtmlToMarkdown = dynamic(() => import('@/components/tools/converter/html-to-markdown').then(mod => mod.HtmlToMarkdown), {
    loading: () => <ToolLoading />,
});

const XmlToJson = dynamic(() => import('@/components/tools/converter/xml-to-json').then(mod => mod.XmlToJson), {
    loading: () => <ToolLoading />,
});

const JsonToXml = dynamic(() => import('@/components/tools/converter/json-to-xml').then(mod => mod.JsonToXml), {
    loading: () => <ToolLoading />,
});

// Utility Tools
const ZipCreator = dynamic(() => import('@/components/tools/utility/zip-creator').then(mod => mod.ZipCreator), {
    loading: () => <ToolLoading />,
});

const ZipExtractor = dynamic(() => import('@/components/tools/utility/zip-extractor').then(mod => mod.ZipExtractor), {
    loading: () => <ToolLoading />,
});

const TextToPdf = dynamic(() => import('@/components/tools/utility/text-to-pdf').then(mod => mod.TextToPdf), {
    loading: () => <ToolLoading />,
});

const HtmlToPdf = dynamic(() => import('@/components/tools/utility/html-to-pdf').then(mod => mod.HtmlToPdf), {
    loading: () => <ToolLoading />,
});

const AudioConverter = dynamic(() => import('@/components/tools/utility/audio-converter').then(mod => mod.AudioConverter), {
    loading: () => <ToolLoading />,
});

const JsMinifier = dynamic(() => import('@/components/tools/utility/js-minifier').then(mod => mod.JsMinifier), {
    loading: () => <ToolLoading />,
});

const CssMinifier = dynamic(() => import('@/components/tools/utility/css-minifier').then(mod => mod.CssMinifier), {
    loading: () => <ToolLoading />,
});

const HtmlMinifier = dynamic(() => import('@/components/tools/utility/html-minifier').then(mod => mod.HtmlMinifier), {
    loading: () => <ToolLoading />,
});

const CodeBeautifier = dynamic(() => import('@/components/tools/utility/code-beautifier').then(mod => mod.CodeBeautifier), {
    loading: () => <ToolLoading />,
});

const QrGenerator = dynamic(() => import('@/components/tools/utility/qr-generator').then(mod => mod.QrGenerator), {
    loading: () => <ToolLoading />,
});

const ColorPicker = dynamic(() => import('@/components/tools/utility/color-picker').then(mod => mod.ColorPicker), {
    loading: () => <ToolLoading />,
});

const PasswordGenerator = dynamic(() => import('@/components/tools/utility/password-generator').then(mod => mod.PasswordGenerator), {
    loading: () => <ToolLoading />,
});

const VideoToMp3 = dynamic(() => import('@/components/tools/utility/video-to-mp3').then(mod => mod.VideoToMp3), {
    loading: () => <ToolLoading />,
});

const ImageCompressor = dynamic(() => import('@/components/tools/utility/image-compressor').then(mod => mod.ImageCompressor), {
    loading: () => <ToolLoading />,
});

// Converter Tools
const PowerAudioConverter = dynamic(() => import('@/components/tools/converter/power-audio-converter').then(mod => mod.PowerAudioConverter), {
    loading: () => <ToolLoading />,
});

const PowerZipCreator = dynamic(() => import('@/components/tools/converter/power-zip-creator').then(mod => mod.PowerZipCreator), {
    loading: () => <ToolLoading />,
});

const DocToPdf = dynamic(() => import('@/components/tools/converter/doc-to-pdf').then(mod => mod.DocToPdf), {
    loading: () => <ToolLoading />,
});

const PdfToDoc = dynamic(() => import('@/components/tools/converter/pdf-to-doc').then(mod => mod.PdfToDoc), {
    loading: () => <ToolLoading />,
});

const CsvToXlsx = dynamic(() => import('@/components/tools/converter/csv-to-xlsx').then(mod => mod.CsvToXlsx), {
    loading: () => <ToolLoading />,
});

const XlsxToCsv = dynamic(() => import('@/components/tools/converter/xlsx-to-csv').then(mod => mod.XlsxToCsv), {
    loading: () => <ToolLoading />,
});

// Preview Tools
const ThreeDViewer = dynamic(() => import('@/components/tools/preview/three-d-viewer').then(mod => mod.ThreeDViewer), {
    loading: () => <ToolLoading />,
    ssr: false, // Three.js needs client-side only
});

const FontPreviewer = dynamic(() => import('@/components/tools/preview/font-previewer').then(mod => mod.FontPreviewer), {
    loading: () => <ToolLoading />,
});

const CsvPreviewer = dynamic(() => import('@/components/tools/preview/csv-previewer').then(mod => mod.CsvPreviewer), {
    loading: () => <ToolLoading />,
});

const XlsxPreviewer = dynamic(() => import('@/components/tools/preview/xlsx-previewer').then(mod => mod.XlsxPreviewer), {
    loading: () => <ToolLoading />,
});

const PdfPreviewer = dynamic(() => import('@/components/tools/preview/pdf-previewer').then(mod => mod.PdfPreviewer), {
    loading: () => <ToolLoading />,
    ssr: false, // PDF.js needs client-side only
});

// New Power Tools
const QrReader = dynamic(() => import('@/components/tools/utility/qr-reader').then(mod => mod.QrReader), {
    loading: () => <ToolLoading />,
});

const HashGenerator = dynamic(() => import('@/components/tools/utility/hash-generator').then(mod => mod.HashGenerator), {
    loading: () => <ToolLoading />,
});

const MarkdownEditor = dynamic(() => import('@/components/tools/text/markdown-editor').then(mod => mod.MarkdownEditor), {
    loading: () => <ToolLoading />,
});

const LoremGenerator = dynamic(() => import('@/components/tools/text/lorem-generator').then(mod => mod.LoremGenerator), {
    loading: () => <ToolLoading />,
});

const ColorPaletteGenerator = dynamic(() => import('@/components/tools/utility/color-palette').then(mod => mod.ColorPaletteGenerator), {
    loading: () => <ToolLoading />,
});

const FaviconGenerator = dynamic(() => import('@/components/tools/utility/favicon-generator').then(mod => mod.FaviconGenerator), {
    loading: () => <ToolLoading />,
});

const PdfMerger = dynamic(() => import('@/components/tools/utility/pdf-merger').then(mod => mod.PdfMerger), {
    loading: () => <ToolLoading />,
});

const KeyboardTester = dynamic(() => import('@/components/tools/utility/keyboard-tester').then(mod => mod.KeyboardTester), {
    loading: () => <ToolLoading />,
});

const TypingTest = dynamic(() => import('@/components/tools/utility/typing-test').then(mod => mod.TypingTest), {
    loading: () => <ToolLoading />,
});

const JsonPreviewer = dynamic(() => import('@/components/tools/preview/json-previewer').then(mod => mod.JsonPreviewer), {
    loading: () => <ToolLoading />,
});

const MarkdownPreviewer = dynamic(() => import('@/components/tools/preview/markdown-previewer').then(mod => mod.MarkdownPreviewer), {
    loading: () => <ToolLoading />,
});

const ImagePreviewer = dynamic(() => import('@/components/tools/preview/image-previewer').then(mod => mod.ImagePreviewer), {
    loading: () => <ToolLoading />,
});

const JsonYamlConverter = dynamic(() => import('@/components/tools/converter/json-yaml-converter').then(mod => mod.JsonYamlConverter), {
    loading: () => <ToolLoading />,
});

const SvgToPngConverter = dynamic(() => import('@/components/tools/converter/svg-to-png-converter').then(mod => mod.SvgToPngConverter), {
    loading: () => <ToolLoading />,
});

const PdfToImageConverter = dynamic(() => import('@/components/tools/converter/pdf-to-image-converter').then(mod => mod.PdfToImageConverter), {
    loading: () => <ToolLoading />,
});

// Component to render individual tools
export function ToolRenderer({ slug }: { slug: string }) {
    switch (slug) {
        // SEO Tools
        case 'meta-title-pixel-checker':
            return <MetaTitleChecker />;
        case 'meta-description-pixel-checker':
            return <MetaDescriptionChecker />;
        case 'robots-txt-validator':
            return <RobotsValidator />;
        case 'canonical-url-checker':
            return <CanonicalChecker />;
        case 'heading-structure-analyzer':
            return <HeadingAnalyzer />;
        case 'keyword-density-checker':
            return <KeywordDensity />;
        case 'seo-slug-optimizer':
            return <SlugOptimizer />;
        case 'serp-preview-tool':
            return <SerpPreview />;
        case 'noindex-nofollow-checker':
            return <NoindexChecker />;
        case 'xml-sitemap-url-counter':
            return <SitemapCounter />;
        case 'website-analyzer':
            return <WebsiteAnalyzer />;
        case 'website-safety-checker':
            return <WebsiteSafetyChecker />;
        case 'seo-checker':
            return <SeoChecker />;

        // Developer Tools
        case 'json-formatter-validator':
            return <JsonFormatter />;
        case 'base64-encode-decode':
            return <Base64Codec />;
        case 'url-encode-decode':
            return <UrlCodec />;
        case 'regex-tester':
            return <RegexTester />;
        case 'jwt-decoder':
            return <JwtDecoder />;
        case 'json-to-csv-converter':
            return <JsonCsvConverter />;

        // Text Tools
        case 'word-counter':
            return <WordCounter />;
        case 'case-converter':
            return <CaseConverter />;
        case 'character-counter':
            return <CharacterCounter />;
        case 'text-diff-checker':
            return <DiffChecker />;
        case 'remove-duplicate-lines':
            return <DuplicateRemover />;
        case 'whitespace-cleaner':
            return <WhitespaceCleaner />;

        // Social Tools
        case 'hashtag-counter':
            return <HashtagCounter />;
        case 'twitter-character-counter':
            return <TwitterCounter />;
        case 'instagram-bio-counter':
            return <InstagramBioChecker />;
        case 'youtube-title-checker':
            return <YouTubeTitleChecker />;
        case 'youtube-description-counter':
            return <YouTubeDescriptionChecker />;

        // Web Tools
        case 'user-agent-parser':
            return <UserAgentParser />;
        case 'http-header-viewer':
            return <HttpHeaderViewer />;
        case 'page-size-checker':
            return <PageSizeChecker />;

        // Converter Tools
        case 'png-to-jpg':
            return <PngToJpg />;
        case 'jpg-to-png':
            return <JpgToPng />;
        case 'image-to-webp':
            return <ImageToWebp />;
        case 'webp-to-png':
            return <WebpToPng />;
        case 'image-resizer':
            return <ImageResizer />;
        case 'image-to-base64':
            return <ImageToBase64 />;
        case 'csv-to-json':
            return <CsvToJson />;
        case 'json-to-csv':
            return <JsonToCsv />;
        case 'markdown-to-html':
            return <MarkdownToHtml />;
        case 'html-to-markdown':
            return <HtmlToMarkdown />;
        case 'xml-to-json':
            return <XmlToJson />;
        case 'json-to-xml':
            return <JsonToXml />;
        case 'json-to-yaml':
            return <JsonYamlConverter />;

        // Utility Tools
        case 'zip-creator':
            return <ZipCreator />;
        case 'zip-extractor':
            return <ZipExtractor />;
        case 'text-to-pdf':
            return <TextToPdf />;
        case 'html-to-pdf':
            return <HtmlToPdf />;
        case 'audio-converter':
            return <AudioConverter />;
        case 'js-minifier':
            return <JsMinifier />;
        case 'css-minifier':
            return <CssMinifier />;
        case 'html-minifier':
            return <HtmlMinifier />;
        case 'code-beautifier':
            return <CodeBeautifier />;
        case 'qr-generator':
            return <QrGenerator />;
        case 'color-picker':
            return <ColorPicker />;
        case 'password-generator':
            return <PasswordGenerator />;
        case 'video-to-mp3':
            return <VideoToMp3 />;
        case 'image-compressor':
            return <ImageCompressor />;

        // Converter Tools
        case 'power-audio-converter':
            return <PowerAudioConverter />;
        case 'power-zip-creator':
            return <PowerZipCreator />;
        case 'doc-to-pdf':
            return <DocToPdf />;
        case 'pdf-to-doc':
            return <PdfToDoc />;
        case 'csv-to-xlsx':
            return <CsvToXlsx />;
        case 'xlsx-to-csv':
            return <XlsxToCsv />;
        case 'svg-to-png':
            return <SvgToPngConverter />;
        case 'pdf-to-image':
            return <PdfToImageConverter />;

        // Preview Tools
        case '3d-model-viewer':
            return <ThreeDViewer />;
        case 'font-previewer':
            return <FontPreviewer />;
        case 'csv-previewer':
            return <CsvPreviewer />;
        case 'xlsx-previewer':
            return <XlsxPreviewer />;
        case 'pdf-previewer':
            return <PdfPreviewer />;
        case 'json-previewer':
            return <JsonPreviewer />;
        case 'markdown-previewer':
            return <MarkdownPreviewer />;
        case 'image-previewer':
            return <ImagePreviewer />;

        // New Power Tools
        case 'qr-reader':
            return <QrReader />;
        case 'hash-generator':
            return <HashGenerator />;
        case 'markdown-editor':
            return <MarkdownEditor />;
        case 'lorem-generator':
            return <LoremGenerator />;
        case 'color-palette':
            return <ColorPaletteGenerator />;
        case 'favicon-generator':
            return <FaviconGenerator />;
        case 'pdf-merger':
            return <PdfMerger />;
        case 'regex-tester':
            return <RegexTester />;
        case 'keyboard-tester':
            return <KeyboardTester />;
        case 'typing-test':
            return <TypingTest />;

        default:
            return (
                <Card className="p-12 text-center bg-slate-50 border-dashed border-slate-300">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Coming Soon</h3>
                    <p className="text-slate-500">
                        The interactive component for <strong>{slug}</strong> is under development.
                    </p>
                </Card>
            );
    }
}

function ToolLoading() {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-500">Loading tool...</p>
        </div>
    );
}
