import gettext
import os
import sys

# --- Configuration ---
DOMAIN = 'myapp'
# IMPORTANT: Use the absolute path to ensure gettext can find the directory.
# Replace '/path/to/your/project/locale' with the actual path to your 'locale' folder.
LOCALE_DIR = os.path.abspath('locale')

print(f"Domain: {DOMAIN}")
print(f"Locale Directory: {LOCALE_DIR}")
print("-" * 50)


## A. GNU gettext API Demonstration (Global)

def demo_gnu_api():
    """
    Demonstrates the traditional GNU API which sets global state.
    Language selection usually depends on system environment variables (LANG, LC_MESSAGES, etc.).
    """
    print("## A. GNU gettext API (Global Scope)")

    # 1. Bind the domain to the locale directory
    # Tells gettext where to look for myapp.mo
    gettext.bindtextdomain(DOMAIN, LOCALE_DIR)

    # 2. Set the current global domain
    gettext.textdomain(DOMAIN)

    # 3. Simulate setting the environment to Chinese ('zh')
    # gettext relies on environment variables for this API.
    os.environ['LANGUAGE'] = 'zh'

    # 4. Get the shorthand function _()
    _ = gettext.gettext
    _n = gettext.ngettext

    print(f"Simulated System Language: {os.environ.get('LANGUAGE')}")

    # --- Simple Translation ---
    MSG_ID = "Hello, world!"
    print(f"\nOriginal: {MSG_ID}")
    # Expected output if 'myapp.mo' has the translation: '你好，世界！'
    print(f"Translation: {_('Hello, world!')}")

    # --- Plural Translation (ngettext) ---
    N = 3
    print(f"\nOriginal Plural (n={N}):")
    # Expected plural output: '有 3 个错误。' (Assuming Chinese translation)
    print(f"Plural Translation: {_n('There is %d error.', 'There are %d errors.', N) % N}")

    # Clean up environment variable for the next demo
    del os.environ['LANGUAGE']
    print("-" * 50)


## B. Class-based API Demonstration (Modular/Flexible)

def demo_class_api():
    """
    Demonstrates the recommended Class-based API for Python modules.
    It allows dynamic switching without relying on global environment variables.
    """
    print("## B. Class-based API (Modular Scope)")

    # 1. Create the 'zh' (Chinese) Translation instance
    # The 'languages' argument explicitly specifies the language.
    zh_trans = gettext.translation(
        DOMAIN,
        localedir=LOCALE_DIR,
        languages=['zh'],
        fallback=True  # If .mo is not found, return a NullTranslations object
    )

    # 2. Create the 'en' (English) Translation instance (used as a fallback in this context)
    en_trans = gettext.translation(
        DOMAIN,
        localedir=LOCALE_DIR,
        languages=['en'],
        fallback=True
    )

    # --- Modular Usage (Local to a function/module) ---
    print("\n--- Modular Usage (No Global Change) ---")

    # Get the specific gettext function from the instance
    zh_gettext = zh_trans.gettext

    print(f"Using zh_trans locally: {zh_gettext('Hello, world!')}")

    # --- Dynamic Global Switching (Using install) ---
    print("\n--- Dynamic Global Switching (t.install()) ---")

    # 3. Install the Chinese translation globally (in the builtins namespace)
    # This sets the global _() function for all modules to use zh_trans.
    zh_trans.install()
    print(f"After installing 'zh', _('Hello, world!'): {_('Hello, world!')}")

    # 4. Switch immediately to the English translation
    en_trans.install()
    # Now, _() points to en_trans (which is likely a NullTranslations, returning the original string)
    print(f"After switching to 'en', _('Hello, world!'): {_('Hello, world!')}")


if __name__ == '__main__':
    # We use importlib.reload to ensure the module state is reset if needed,
    # though for simplicity in a single script, direct calls usually suffice.
    import importlib
    importlib.reload(gettext)

    demo_gnu_api()
    demo_class_api()