use std::{env, path::PathBuf, path::Path, fs::{self, DirEntry, create_dir, File}, thread, io::Write};

struct ReservedEntity {
    path: &'static str,
    resolve: fn(ReservedEntity, &str, &str)
}

fn resolve_module_ts(entity: ReservedEntity, index_file_path: &str, module_path: &str) {
    let mut abs_path_to_file_str = String::from(module_path);

    abs_path_to_file_str
        .push_str(entity.path);
}

const KNOWN_ENTITIES: [ReservedEntity; 1] = [
    ReservedEntity {
        path: "module.ts",
        resolve: resolve_module_ts
    }
];

fn get_current_dir() -> PathBuf {
    return env::current_dir().unwrap();
}

fn get_path_to_modules() -> PathBuf {
    let modules_path = Path::new("modules");
    return get_current_dir().as_path().join(modules_path);
}

fn get_list_of_modules() -> Vec<DirEntry> {
    let path_to_modules = get_path_to_modules();

    let entries = fs::read_dir(path_to_modules).unwrap();

    return entries
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.file_type().unwrap().is_dir())
        .collect();
}

fn get_framework_dir_path() -> PathBuf {
    return get_current_dir()
            .as_path()
            .join(Path::new(".jahad"));
}

fn get_compiled_dir_path() -> PathBuf {
    return get_framework_dir_path()
            .as_path()
            .join(Path::new("compiled"))
}

fn create_framework_dir() -> Result<(), std::io::Error> {
    return fs::create_dir(get_framework_dir_path())
}

fn create_compiled_dir() -> Result<(), std::io::Error> {
    return fs::create_dir(get_compiled_dir_path())
}

fn ensure_framework_dir() -> bool {
    let framework_dir_path = get_current_dir()
            .as_path()
            .join(Path::new(".jahad"));

    if let Ok(metadata) = fs::metadata(framework_dir_path) {
        if metadata.is_dir() {
            return true;
        } else {
            return false;
        }
    }

    match create_framework_dir() {
        Ok(_) => return true,
        Err(_) => return false 
    }
}

fn ensure_compiled_dir() -> bool {
    if let Ok(metadata) = fs::metadata(
        get_compiled_dir_path()
    ) {
        if metadata.is_dir() {
            return true;
        } else {
            return false
        }
    }

    match create_compiled_dir() {
        Ok(_) => return true,
        Err(_) => return false
    }
}

fn get_module_name_from_path(module_path: &PathBuf) -> &str {
    let path = module_path
        .file_name()
        .unwrap()
        .to_str()
        .unwrap();

    return path;
}

fn create_compiled_module_dir(compiled_module_path: &PathBuf) {
    match create_dir(compiled_module_path) {
        Ok(_) => {},
        Err(_) => {}
    };
}

fn compile_module(module_path: PathBuf) {
    let module_name = get_module_name_from_path(&module_path);

    let compiled_dir_path = get_compiled_dir_path();

    create_compiled_module_dir(&compiled_dir_path);

    let index_file_path = &compiled_dir_path
        .join(module_name)
        .join(Path::new("index.ts"));

    let index_file_path_string = index_file_path.to_str().unwrap();
    let module_path_string = module_path.to_str().unwrap();

    File::create(
            index_file_path
    ).unwrap();

    KNOWN_ENTITIES
        .into_iter()
        .for_each(|entity| {
            (entity.resolve)(
                entity,
                index_file_path_string,
                module_path_string
            )   
        })
}

fn main() {
    let modules_dirs = get_list_of_modules();
    
    let is_framework_dir_fine = ensure_framework_dir();
    
    if !is_framework_dir_fine {
        println!("Can not access .jahad dir");

        return;
    }

    if !ensure_compiled_dir() {
        println!("Can not ensure .jahad/compiled directory");

        return;
    }

    let mut threads = Vec::new();

    modules_dirs
        .into_iter()
        .for_each(|dir| {
            threads.push(
                thread::spawn(move || {
                    compile_module(dir.path())
                })
            )
        });

    for thread in threads {
        thread.join().unwrap();
    }
}
