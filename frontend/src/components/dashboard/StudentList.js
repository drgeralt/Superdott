const StudentList = () => (
    <section className="col-span-12 md:col-span-3 space-y-4">
        <div className="bg-surface-container-low rounded-xl p-4">
            <h3 className="font-headline font-bold text-sm mb-4 text-on-surface-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">group</span>
                Turma 9º Ano A
            </h3>
            <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border-l-4 border-primary-navy text-left transition-all">
                    <img className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAduyinYArfUxj7x83I-JFOGxFImjyZHPJ6DG50bu-l8aXRb47YqSgMHuT11vDoT2n0hOdz59iAg00sc60bOh6Y9uWm41KjELxS7iVmjgPt4wOK_YIHVJ5ylz66lS93LkBrAyp4OnEo92w_FWSmV1TZQIQmA3TULwc2o2NtPOpbw_Vab9pTZgLUx4N6kV4_F_zbWN9CeOA-6MmFMjfuHGrhabIvw_HD8UcxKlS9Yj3ywCqnEYiwsLnUrMgHT0QHucP5HY6Yxg29QC8" alt="Avatar Ana" />
                    <div>
                        <p className="text-sm font-bold font-headline text-primary-navy">Ana Beatriz Silva</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">Atenção Especial</p>
                    </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-surface-container-high rounded-xl text-left transition-all group">
                    <img className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGbri4_4A_zCRuyKBhbGfj2RHl-h4jgnD3G4aV9SLtXdru76kOFBtC8SAR3VMSvkDOI5cIM7tczs7Os7TyOaQ6-UGpyEakWt1FsDp3ONmz6o1Zw0662rE6GUS5BJVOvbx2_4DDlajAgS1PxT_Pe7WVnXXvBK-4GMFr5dgKlzVAjd3acvPTy7i_eiT88UlmoXVH7wHsYg-TCsBl2kdkFQiRvbRbPggFlYJWzu4qsiJ2sFMolbNGhpnDgUddD6ZpRzOe3UQw11BQQ1I" alt="Avatar Carlos" />
                    <div>
                        <p className="text-sm font-bold font-headline text-on-surface group-hover:text-primary-navy transition-colors">Carlos Eduardo</p>
                        <p className="text-[10px] text-on-surface-variant">Progresso Estável</p>
                    </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 hover:bg-surface-container-high rounded-xl text-left transition-all group">
                    <img className="w-10 h-10 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSo31FmCtqXC40cZ8W-PT3XAf_AJEnpHqXINYtbQx1b6UISkHmH1q5vIKMSfDH3vi8fCmQzIvpjoPDsY0ci5EBQWPCD7Uit_4TggXFyQqZbYEQL2gQvqJI3E-_jF6MLgcJh_PYTwTZLgLU7ybtzRx4L2pDqizjdmjdkkLDFG8MfD8s2DmTwkcQcGCShksrxQftz31U9uzJpnuPHKKWEnP9aS6k2vPTLngohv2eSdQA39ZHuiFQ5jL6otKUZ7ic7Kl5EkQtsgJKX2A" alt="Avatar Mariana" />
                    <div>
                        <p className="text-sm font-bold font-headline text-on-surface group-hover:text-primary-navy transition-colors">Mariana Oliveira</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">Destaque Criativo</p>
                    </div>
                </button>
            </div>
        </div>
    </section>
);