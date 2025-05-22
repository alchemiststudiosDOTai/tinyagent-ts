# Auto-generated helper the code-runner mounts.
import json, sys, os, requests  # stdlib only


def _call_tool(name, args):
    import urllib.request, urllib.parse, json, os
    payload = json.dumps({"tool": name, "args": args}).encode()
    req = urllib.request.Request(
        "http://127.0.0.1:8123/tool",
        data=payload,
        headers={"Content-Type": "application/json"},
    )
    return json.loads(urllib.request.urlopen(req).read().decode())


def stockQuote(symbol):
    return _call_tool("stockQuote", {"symbol": symbol})


def topNewsUrl(query):
    return _call_tool("topNewsUrl", {"query": query})


def fetchPage(url, max_len):
    return _call_tool("fetchPage", {"url": url, "maxLength": max_len})
