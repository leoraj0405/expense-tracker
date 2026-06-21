import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'app');

const routes = [
  ['login', '@/views/Login'],
  ['parentlogin', '@/views/ParentLogin'],
  ['parenthome', '@/views/ParentHome'],
  ['home', '@/views/Dashboard'],
  ['registration', '@/views/SignupPage'],
  ['forgetpassword', '@/views/ForgetPassword'],
  ['userprofile', '@/views/Profile'],
  ['expense', '@/views/myExpenses/ListMyExpense'],
  ['expense/addexpense', '@/views/myExpenses/AddMyExpense'],
  ['editexpense', '@/views/myExpenses/AddMyExpense'],
  ['category', '@/views/category/CategoryList'],
  ['category/addcategory', '@/views/category/AddCategory'],
  ['category/editcategory/[id]', '@/views/category/AddCategory'],
  ['group', '@/views/group/GroupList'],
  ['group/addgroup', '@/views/group/AddGroup'],
  ['group/editgroup', '@/views/group/AddGroup'],
  ['group/groupmember', '@/views/grpMember/GrpMember'],
  ['group/groupmember/addgroupmember', '@/views/grpMember/AddGrpMember'],
  ['group/groupmember/editgroupmember', '@/views/grpMember/AddGrpMember'],
  ['group/groupexpense', '@/views/grpExpense/GrpExpense'],
  ['group/groupexpense/addgroupexpense', '@/views/grpExpense/AddGrpExpense'],
  ['group/groupexpense/editgroupexpense', '@/views/grpExpense/AddGrpExpense'],
  ['group/settlement', '@/views/group/Settlements'],
];

for (const [route, importPath] of routes) {
  const dir = path.join(APP, route);
  fs.mkdirSync(dir, { recursive: true });
  const name = importPath.split('/').pop();
  fs.writeFileSync(
    path.join(dir, 'page.tsx'),
    `import ${name} from '${importPath}';\n\nexport default ${name};\n`,
  );
}

console.log(`Created ${routes.length} route pages`);
