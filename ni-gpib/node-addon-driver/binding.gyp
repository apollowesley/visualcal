{
  'targets': [
    {
      'target_name': 'indysoft-ni-gpib-native',
      'sources': [ 'src/indysoft_ni_gpib.cc' ],
      'include_dirs': [
        "<!@(node -p \"require('node-addon-api').include\")",
        "./ni-gpib/headers"
        ],
      'dependencies': ["<!(node -p \"require('node-addon-api').gyp\")"],
      'libraries' : [
        "-Wl,-rpath,./ni-gpib/Resources/ni4882.o"
      ],
      'cflags!': [ '-fno-exceptions' ],
      'cflags_cc!': [ '-fno-exceptions' ],
      'xcode_settings': {
        'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
        'CLANG_CXX_LIBRARY': 'libc++',
        'MACOSX_DEPLOYMENT_TARGET': '10.7'
      },
      'msvs_settings': {
        'VCCLCompilerTool': { 'ExceptionHandling': 1 },
      }
    }
  ]
}
