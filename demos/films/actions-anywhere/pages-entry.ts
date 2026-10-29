/**
 * coere-v2's fake web pages for the film's top page (sites.mjs bundles
 * this as fake-pages.js): every host's server and the store they share,
 * the same objects the films' Playwright fixture serves from.
 */
import { fakePages, PAGE_HOSTS } from "@v2/tests/fake-pages/hosts";
import { createPagesStore } from "@v2/tests/fake-pages/store";

Object.assign(globalThis, { __fakePages: { fakePages, createPagesStore, PAGE_HOSTS } });
