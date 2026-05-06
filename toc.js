// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="00-cover.html"><strong aria-hidden="true">1.</strong> 封面</a></li><li class="chapter-item expanded "><a href="01-copyright.html"><strong aria-hidden="true">2.</strong> 版权与使用说明</a></li><li class="chapter-item expanded "><a href="02-preface.html"><strong aria-hidden="true">3.</strong> 前言</a></li><li class="chapter-item expanded "><div><strong aria-hidden="true">4.</strong> 第一篇：重新理解 Agent</div><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="chapter-01-why-systematically-learn-agent.html"><strong aria-hidden="true">4.1.</strong> 第 1 章：为什么要系统学习 Agent</a></li><li class="chapter-item "><a href="chapter-02-agent-capability-model.html"><strong aria-hidden="true">4.2.</strong> 第 2 章：Agent 的能力模型</a></li><li class="chapter-item "><a href="chapter-03-when-to-use-agent.html"><strong aria-hidden="true">4.3.</strong> 第 3 章：什么时候该用 Agent，什么时候不该用 Agent</a></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">5.</strong> 第二篇：Agent 核心机制</div><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="chapter-04-agent-loop.html"><strong aria-hidden="true">5.1.</strong> 第 4 章：Agent Loop：从 Observe 到 Act</a></li><li class="chapter-item "><a href="chapter-05-tool-system.html"><strong aria-hidden="true">5.2.</strong> 第 5 章：工具系统：Agent 的手和脚</a></li><li class="chapter-item "><a href="chapter-06-context-engineering.html"><strong aria-hidden="true">5.3.</strong> 第 6 章：上下文工程：Agent 的工作记忆</a></li><li class="chapter-item "><a href="chapter-07-planning.html"><strong aria-hidden="true">5.4.</strong> 第 7 章：Planning：让 Agent 做正确的下一步</a></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">6.</strong> 第三篇：记忆、知识库与长期任务</div><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="chapter-08-memory.html"><strong aria-hidden="true">6.1.</strong> 第 8 章：Memory：Agent 如何越用越懂你</a></li><li class="chapter-item "><a href="chapter-09-rag-knowledge-base.html"><strong aria-hidden="true">6.2.</strong> 第 9 章：RAG 与知识库：让 Agent 使用外部知识</a></li><li class="chapter-item "><a href="chapter-10-long-running-agent.html"><strong aria-hidden="true">6.3.</strong> 第 10 章：Long-running Agent：长任务、调度与恢复</a></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">7.</strong> 第四篇：可控、安全、可评估的 Agent</div><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="chapter-11-human-in-the-loop.html"><strong aria-hidden="true">7.1.</strong> 第 11 章：Human-in-the-loop：人机协同与审批系统</a></li><li class="chapter-item "><a href="chapter-12-evaluation.html"><strong aria-hidden="true">7.2.</strong> 第 12 章：Evaluation：如何判断 Agent 是否真的有用</a></li><li class="chapter-item "><a href="chapter-13-observability.html"><strong aria-hidden="true">7.3.</strong> 第 13 章：Observability：让 Agent 的行为可追踪</a></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">8.</strong> 第五篇：源码研究与架构模式</div><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="chapter-14-how-to-read-agent-source-code.html"><strong aria-hidden="true">8.1.</strong> 第 14 章：如何阅读 Agent 项目源码</a></li><li class="chapter-item "><a href="chapter-15-openclaw-hermes-claude-code.html"><strong aria-hidden="true">8.2.</strong> 第 15 章：OpenClaw、Hermes 类助理、Claude Code 与 Codex 的学习价值</a></li><li class="chapter-item "><a href="chapter-16-design-your-agent-runtime.html"><strong aria-hidden="true">8.3.</strong> 第 16 章：从源码中提炼自己的 Agent Runtime</a></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">9.</strong> 第六篇：综合实战项目</div><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="chapter-17-research-agent.html"><strong aria-hidden="true">9.1.</strong> 第 17 章：项目一：任务型研究 Agent</a></li><li class="chapter-item "><a href="chapter-18-foreign-trade-agent.html"><strong aria-hidden="true">9.2.</strong> 第 18 章：项目二：外贸客户开发 Agent</a></li><li class="chapter-item "><a href="chapter-19-code-agent-mini.html"><strong aria-hidden="true">9.3.</strong> 第 19 章：项目三：代码开发 Agent Mini 版</a></li><li class="chapter-item "><a href="chapter-20-from-demo-to-product.html"><strong aria-hidden="true">9.4.</strong> 第 20 章：从 Demo 到产品：Agent 系统如何持续演进</a></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">10.</strong> 附录</div><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="appendix/appendix-a-agent-glossary.html"><strong aria-hidden="true">10.1.</strong> 附录 A：Agent 术语表</a></li><li class="chapter-item "><a href="appendix/appendix-b-prompt-patterns.html"><strong aria-hidden="true">10.2.</strong> 附录 B：Prompt 模式与模板</a></li><li class="chapter-item "><a href="appendix/appendix-c-tool-schema-examples.html"><strong aria-hidden="true">10.3.</strong> 附录 C：Tool Schema 示例</a></li><li class="chapter-item "><a href="appendix/appendix-d-agent-evaluation-template.html"><strong aria-hidden="true">10.4.</strong> 附录 D：Agent 评估模板</a></li><li class="chapter-item "><a href="appendix/appendix-e-source-code-reading-template.html"><strong aria-hidden="true">10.5.</strong> 附录 E：源码阅读模板</a></li><li class="chapter-item "><a href="appendix/appendix-f-90-day-learning-roadmap.html"><strong aria-hidden="true">10.6.</strong> 附录 F：90 天学习路线</a></li><li class="chapter-item "><a href="appendix/appendix-g-six-month-project-roadmap.html"><strong aria-hidden="true">10.7.</strong> 附录 G：6 个月项目路线</a></li></ol></li><li class="chapter-item expanded "><div><strong aria-hidden="true">11.</strong> 辅助文档</div><a class="toggle"><div>❱</div></a></li><li><ol class="section"><li class="chapter-item "><a href="extras/figure-index.html"><strong aria-hidden="true">11.1.</strong> 插图索引</a></li><li class="chapter-item "><a href="extras/total-index.html"><strong aria-hidden="true">11.2.</strong> 全书总索引</a></li><li class="chapter-item "><a href="extras/exercise-summary.html"><strong aria-hidden="true">11.3.</strong> 练习汇总</a></li><li class="chapter-item "><a href="extras/exercise-answer-guide.html"><strong aria-hidden="true">11.4.</strong> 练习参考答案与评分指南</a></li><li class="chapter-item "><a href="extras/code-directory-guide.html"><strong aria-hidden="true">11.5.</strong> 代码目录说明</a></li><li class="chapter-item "><a href="extras/companion-code-tasks.html"><strong aria-hidden="true">11.6.</strong> 配套代码工程任务书</a></li><li class="chapter-item "><a href="extras/references.html"><strong aria-hidden="true">11.7.</strong> 参考资料与事实边界</a></li></ol></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString();
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);
