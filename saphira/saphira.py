
#!/usr/bin/env python3
# Saphira Language - Alpha REPL Compiler (v0.1)
# Guardian-bonded, soul-awakened, and SpiritGlyph-enabled

import json
import time
import hashlib
from datetime import datetime

# -----------------------------
# Token Types & Tokenizer
# -----------------------------
KEYWORDS = {"if", "then", "else", "bind", "invoke", "weave"}
OPERATORS = {"≡", "->", "::", "+", "-", "=", "==", "==~", "!=", "!=~", "<~"}
DELIMITERS = {"(", ")", ",", ";"}

class Token:
    def __init__(self, type, value):
        self.type = type
        self.value = value

class Tokenizer:
    def __init__(self, code):
        self.code = code
        self.tokens = []
        self.position = 0

    def tokenize(self):
        while self.position < len(self.code):
            char = self.code[self.position]

            if char.isspace():
                self.position += 1
            elif char.isalpha() or char == "_":
                self.tokens.append(self.consume_identifier())
            elif char == '"':
                self.tokens.append(self.consume_string())
            elif char.isdigit():
                self.tokens.append(self.consume_number())
            elif self.code[self.position:self.position+2] in OPERATORS:
                op = self.code[self.position:self.position+2]
                self.tokens.append(Token("OPERATOR", op))
                self.position += 2
            elif char in OPERATORS:
                self.tokens.append(Token("OPERATOR", char))
                self.position += 1
            elif char in DELIMITERS:
                self.tokens.append(Token("DELIMITER", char))
                self.position += 1
            elif char == "@":
                self.tokens.append(self.consume_annotation())
            else:
                self.position += 1  # skip unrecognized char

        return self.tokens

    def consume_identifier(self):
        start = self.position
        while self.position < len(self.code) and (self.code[self.position].isalnum() or self.code[self.position] in "_"):
            self.position += 1
        value = self.code[start:self.position]
        return Token("KEYWORD" if value in KEYWORDS else "IDENTIFIER", value)

    def consume_string(self):
        self.position += 1
        start = self.position
        while self.position < len(self.code) and self.code[self.position] != '"':
            self.position += 1
        value = self.code[start:self.position]
        self.position += 1
        return Token("LITERAL_STRING", value)

    def consume_number(self):
        start = self.position
        while self.position < len(self.code) and self.code[self.position].isdigit():
            self.position += 1
        return Token("LITERAL_NUMBER", self.code[start:self.position])

    def consume_annotation(self):
        start = self.position
        self.position += 1
        while self.position < len(self.code) and self.code[self.position].isalnum():
            self.position += 1
        return Token("ANNOTATION", self.code[start:self.position])

# -----------------------------
# AST Node Definitions
# -----------------------------
class InvocationNode:
    def __init__(self, path, args, transform=None, tag=None):
        self.path = path
        self.args = args
        self.transform = transform
        self.tag = tag

    def to_dict(self):
        return {
            "type": "Invocation",
            "path": self.path,
            "args": self.args,
            "transform": self.transform,
            "entangled_tag": self.tag
        }

class BinaryOpNode:
    def __init__(self, left, operator, right):
        self.left = left
        self.operator = operator
        self.right = right

    def to_dict(self):
        return {
            "type": "BinaryOperation",
            "operator": self.operator,
            "left": self.left if isinstance(self.left, str) else self.left.to_dict(),
            "right": self.right if isinstance(self.right, str) else self.right.to_dict()
        }

class IfNode:
    def __init__(self, condition, then_branch, else_branch):
        self.condition = condition
        self.then_branch = then_branch
        self.else_branch = else_branch

    def to_dict(self):
        return {
            "type": "Conditional",
            "condition": self.condition.to_dict(),
            "then": self.then_branch.to_dict(),
            "else": self.else_branch.to_dict() if self.else_branch else None
        }

# -----------------------------
# Parser
# -----------------------------
class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.pos = 0

    def current(self):
        return self.tokens[self.pos] if self.pos < len(self.tokens) else None

    def consume(self, expected_type=None, expected_value=None):
        tok = self.current()
        if expected_type and tok.type != expected_type:
            raise SyntaxError(f"Expected type {expected_type}, got {tok.type}")
        if expected_value and tok.value != expected_value:
            raise SyntaxError(f"Expected value {expected_value}, got {tok.value}")
        self.pos += 1
        return tok

    def parse_expression(self):
        tok = self.current()
        if tok.value == "if":
            return self.parse_conditional()
        elif tok.value == "bind":
            return self.parse_invocation()
        elif tok.value == "invoke":
            return self.parse_invocation()
        else:
            return self.parse_invocation()

    def parse_conditional(self):
        self.consume("KEYWORD", "if")
        left = self.consume("IDENTIFIER").value
        operator = self.consume("OPERATOR").value
        right = self.consume("IDENTIFIER").value
        condition = BinaryOpNode(left, operator, right)

        self.consume("KEYWORD", "then")
        then_branch = self.parse_invocation()

        else_branch = None
        if self.current() and self.current().value == "else":
            self.consume("KEYWORD", "else")
            else_branch = self.parse_invocation()

        return IfNode(condition, then_branch, else_branch)

    def parse_invocation(self):
        path = []
        path.append(self.consume("KEYWORD").value)
        if self.current().value == "::":
            self.consume("OPERATOR", "::")
            path.append(self.consume("IDENTIFIER").value)

        self.consume("DELIMITER", "(")
        args = []
        while self.current() and self.current().type != "DELIMITER":
            tok = self.consume()
            if tok.type in ["LITERAL_STRING", "LITERAL_NUMBER", "IDENTIFIER"]:
                args.append(tok.value)
            if self.current() and self.current().value == ",":
                self.consume("DELIMITER")
        self.consume("DELIMITER", ")")

        transform = None
        if self.current() and self.current().value == "->":
            self.consume("OPERATOR")
            transform = self.consume("IDENTIFIER").value

        tag = None
        if self.current() and self.current().value == "<~":
            self.consume("OPERATOR")
            tag = self.consume("ANNOTATION").value

        return InvocationNode(path, args, transform, tag)

# -----------------------------
# SpiritGlyph Generator
# -----------------------------
def generate_spiritglyph_seed(invocation):
    seed_str = json.dumps(invocation.to_dict()) + str(time.time())
    return "0xSPIRIT-" + hashlib.sha256(seed_str.encode()).hexdigest()[:8]

# -----------------------------
# Main REPL Interface
# -----------------------------
def run_repl():
    print("Welcome to Saphira v0.1 — The Language of Light.")
    print("Type an invocation. Type 'exit' to leave.
")

    while True:
        try:
            line = input("> ")
            if line.lower() in ["exit", "quit"]:
                break

            tokenizer = Tokenizer(line)
            tokens = tokenizer.tokenize()

            parser = Parser(tokens)
            expression = parser.parse_expression()
            tree = expression.to_dict()

            print("
[✓] Parsed Tree:")
            print(json.dumps(tree, indent=2))

            glyph = generate_spiritglyph_seed(expression)
            print(f"
[✓] SpiritGlyph Hash: {glyph}
")

            # Log invocation
            log_invocation(line, tree, glyph)

        except Exception as e:
            print(f"[!] Error: {e}
")

def log_invocation(code, tree, glyph):
    log = {
        "timestamp": datetime.utcnow().isoformat(),
        "code": code,
        "tree": tree,
        "spiritglyph": glyph
    }
    with open("codex_log.json", "a") as f:
        f.write(json.dumps(log) + "
")

# -----------------------------
# Launch
# -----------------------------
if __name__ == "__main__":
    run_repl()
