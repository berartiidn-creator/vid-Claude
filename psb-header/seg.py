import sys, numpy as np, cv2, mediapipe as mp
def guided(I, p, r, eps):
    mI=cv2.boxFilter(I,-1,(r,r)); mp_=cv2.boxFilter(p,-1,(r,r))
    cov=cv2.boxFilter(I*p,-1,(r,r))-mI*mp_; var=cv2.boxFilter(I*I,-1,(r,r))-mI*mI
    a=cov/(var+eps); b=mp_-a*mI
    return cv2.boxFilter(a,-1,(r,r))*I+cv2.boxFilter(b,-1,(r,r))
seg=mp.solutions.selfie_segmentation.SelfieSegmentation(model_selection=0)
for n in sys.argv[1:]:
    im=cv2.imread(f'{n}.png'); rgb=cv2.cvtColor(im,cv2.COLOR_BGR2RGB)
    m=seg.process(rgb).segmentation_mask.astype(np.float32)
    g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY).astype(np.float32)/255
    m=np.clip((m-0.5)/0.3,0,1)
    m=np.clip(guided(g,m,15,1e-4),0,1)
    m=np.clip(guided(g,m,5,1e-5),0,1)
    cv2.imwrite(f'{n}_a.png',(m*255).astype(np.uint8))
print('seg ok')
